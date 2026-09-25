"use client" //This is used to ensure hooks like useStae/useContext run in the browser which is important becuase the context is a mutable runtime state

import React, { createContext, useContext, useState } from "react"
import { getLogger } from '@/lib/logger'

export type BusRoute = {
  route_id: string
  route_short_name: string
  route_long_name: string
  route_color?: string
}

export type BusStop = {
  id: string
  name: string
  coords: [number, number]
  // optional fields returned by the upstream API
  distanceM?: number
  routes_served?: BusRoute[]
  // transit agency slug, e.g. "ac-transit"
  agency?: string
}

// `agency` may come back as a plain id/name or as an object; reduce it to a slug like "ac-transit"
function parseAgency(raw: any): string | undefined {
  const value = typeof raw === 'string' ? raw : raw?.agency_id ?? raw?.id ?? raw?.agency_name ?? raw?.name
  if (typeof value !== 'string' || !value.trim()) return undefined
  return value.trim().toLowerCase().replace(/[\s_]+/g, '-')
}

// Routes arrive either as objects ({ id, shortName, longName, color }) or, from older API
// versions, as JSON-encoded strings with snake_case keys. Normalise to BusRoute[] and drop
// anything unparseable.
function parseRoutes(raw: unknown): BusRoute[] {
  if (!Array.isArray(raw)) return []
  return raw.flatMap((r) => {
    try {
      const obj = typeof r === 'string' ? JSON.parse(r) : r
      const shortName = obj?.shortName ?? obj?.route_short_name
      if (typeof shortName !== 'string') return []
      return [{
        route_id: obj.id ?? obj.route_id,
        route_short_name: shortName,
        route_long_name: obj.longName ?? obj.route_long_name ?? '',
        route_color: obj.color ?? obj.route_color,
      }]
    } catch {
      return []
    }
  })
}

//Shape of the context value
type Ctx = {
  stops: BusStop[]
  // React state updater function that either accepts a new array of busStops or will accept the previous state and return a new array of busStops
  setStops: React.Dispatch<React.SetStateAction<BusStop[]>>
  // refreshStops allows consumers to request stops from the server (options: lat, lon)
  // uniqueOnly overrides the context value for this call (useful right after toggling it)
  refreshStops?: (opts?: { lat?: number; lon?: number; uniqueOnly?: boolean }) => Promise<void>
  // when true, stop searches send uniqueOnly=true to the API
  uniqueOnly: boolean
  setUniqueOnly: (v: boolean) => void
  // stop picked on the map that the list should scroll to and flash; cleared once handled
  highlightedStopId: string | null
  setHighlightedStopId: (id: string | null) => void
  // the last searched location (stored as [lon, lat]) when a location search was performed
  searchedLocation?: [number, number] | null
  setSearchedLocation?: (v: [number, number] | null) => void
  // whether a refresh is in progress
  loading?: boolean
}

//Create the context (solves the problem of prop drilling)
const BusStopsContext = createContext<Ctx | undefined>(undefined)

export function BusStopsProvider({ children }: { children: React.ReactNode }) {
  const [stops, setStops] = useState<BusStop[]>([])
  const [loading, setLoading] = useState(false)
  const [searchedLocation, setSearchedLocation] = useState<[number, number] | null>(null)
  const [uniqueOnly, setUniqueOnly] = useState(false)
  const [highlightedStopId, setHighlightedStopId] = useState<string | null>(null)

  async function refreshStops(opts?: { lat?: number; lon?: number; uniqueOnly?: boolean }) {
    setLoading(true)
    try {
      // Build the upstream path + query (client-side) and send it to the server for proxying.
      const endpointBase = 'bus-stops/nearest-stops'
      const epParams = new URLSearchParams()
      if (typeof opts?.lat === 'number') epParams.set('latitude', String(opts.lat))
      if (typeof opts?.lon === 'number') epParams.set('longitude', String(opts.lon))
      if (opts?.uniqueOnly ?? uniqueOnly) epParams.set('uniqueOnly', 'true')
      const endpointFull = endpointBase + (epParams.toString() ? `?${epParams.toString()}` : '')

      const url = `/api/stops?endpoint=${encodeURIComponent(endpointFull)}`
      const res = await fetch(url)
      if (!res.ok) throw new Error(await res.text())
      const raw = await res.json()
      let mapped: BusStop[] = []
      if (Array.isArray(raw)) {
        // already an array of stops matching our shape
        mapped = raw.map((s: any) => ({
          id: s.id,
          name: s.name,
          coords: s.coords || [s.longitude ?? s.lon ?? 0, s.latitude ?? s.lat ?? 0],
          distanceM: s.distanceM,
          routes_served: parseRoutes(s.routes_served ?? s.routes),
          agency: parseAgency(s.agency),
        }))
      } else if (raw && Array.isArray(raw.busStops)) {
        // sample API shape { busStops: [ { longitude, latitude, ... } ], uniqueRoutes, ... }
        mapped = raw.busStops.map((b: any) => ({
          id: b.id,
          name: b.name,
          coords: [b.longitude, b.latitude],
          distanceM: b.distanceM,
          routes_served: parseRoutes(b.routes_served ?? b.routes),
          agency: parseAgency(b.agency),
        }))
      } else {
        console.warn('Unknown stops payload', raw)
      }
      setStops(mapped)
      // record searched location when explicit lat/lon provided (coerce strings to numbers)
      const latN = opts?.lat != null ? Number(opts.lat) : NaN
      const lonN = opts?.lon != null ? Number(opts.lon) : NaN
      if (Number.isFinite(latN) && Number.isFinite(lonN)) {
        setSearchedLocation([lonN, latN])
      } else {
        getLogger('BusStopsProvider').warn('refreshStops: provided coords not numeric', opts)
      }
    } catch (err) {
      getLogger('BusStopsProvider').error('refreshStops error', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <BusStopsContext.Provider value={{ stops, setStops, refreshStops, uniqueOnly, setUniqueOnly, highlightedStopId, setHighlightedStopId, loading, searchedLocation, setSearchedLocation }}>
      {children}
    </BusStopsContext.Provider>
  )
}

export function useBusStops() {
  const ctx = useContext(BusStopsContext)
  if (!ctx) throw new Error("useBusStops must be used inside BusStopsProvider")
  return ctx
}