"use client" //This is used to ensure hooks like useStae/useContext run in the browser which is important becuase the context is a mutable runtime state

import React, { createContext, useContext, useState } from "react"

export type BusStop = {
  id: string
  name: string
  coords: [number, number]
  // optional fields returned by the upstream API
  distanceM?: number
  routes?: string[]
}

//Shape of the context value
type Ctx = {
  stops: BusStop[]
  // React state updater function that either accepts a new array of busStops or will accept the previous state and return a new array of busStops
  setStops: React.Dispatch<React.SetStateAction<BusStop[]>>
  // refreshStops allows consumers to request stops from the server (options: lat, lon)
  refreshStops?: (opts?: { lat?: number; lon?: number }) => Promise<void>
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

  async function refreshStops(opts?: { lat?: number; lon?: number }) {
    setLoading(true)
    try {
      // Build the upstream path + query (client-side) and send it to the server for proxying.
      const endpointBase = 'bus-stops/nearest-stops-by-line'
      const epParams = new URLSearchParams()
      if (typeof opts?.lat === 'number') epParams.set('latitude', String(opts.lat))
      if (typeof opts?.lon === 'number') epParams.set('longitude', String(opts.lon))
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
          routes: s.routes,
        }))
      } else if (raw && Array.isArray(raw.busStops)) {
        // sample API shape { busStops: [ { longitude, latitude, ... } ], uniqueRoutes, ... }
        mapped = raw.busStops.map((b: any) => ({
          id: b.id,
          name: b.name,
          coords: [b.longitude, b.latitude],
          distanceM: b.distanceM,
          routes: b.routes,
        }))
      } else {
        console.warn('Unknown stops payload', raw)
      }
      setStops(mapped)
      // record searched location when explicit lat/lon provided
      if (typeof opts?.lat === 'number' && typeof opts?.lon === 'number') {
        setSearchedLocation([opts.lon, opts.lat])
      }
    } catch (err) {
      console.error('refreshStops error', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <BusStopsContext.Provider value={{ stops, setStops, refreshStops, loading, searchedLocation, setSearchedLocation }}>
      {children}
    </BusStopsContext.Provider>
  )
}

export function useBusStops() {
  const ctx = useContext(BusStopsContext)
  if (!ctx) throw new Error("useBusStops must be used inside BusStopsProvider")
  return ctx
}