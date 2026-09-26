"use client" //This is used to ensure hooks like useStae/useContext run in the browser which is important becuase the context is a mutable runtime state

import React, { createContext, useContext, useState, useEffect, useRef } from "react"
import { useBusStops } from './BusStopsContext'
import type { BusRoute } from './BusStopsContext'
import logger, { getLogger } from '@/lib/logger'
import { PLACE_CATEGORIES, categorizePlace } from '@/lib/placeCategories'
import type { PlaceCategoryId } from '@/lib/placeCategories'

export type Place = {
  id: string
  name: string
  coords: [number, number]
  // optional fields returned by the upstream API
  distanceM?: number
  routes?: string[]
  category?: string
  // one of the 8 major categories, derived from `category`
  group: PlaceCategoryId
  // downstream places only: the stop to get off at, walk from it, and bus ride time to it
  closestStopId?: string
  closestStopName?: string
  distanceToStopM?: number
  travelTimeSec?: number
  // number of stops ridden from the boarding stop to closestStopId
  stopsFromOrigin?: number
}

// Straight-line distance in meters between two [lon, lat] points
function haversineM([lon1, lat1]: [number, number], [lon2, lat2]: [number, number]): number {
  const R = 6371000
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}

//Shape of the context value
type Ctx = {
  places: Place[]
  // React state updater function that either accepts a new array of Places or will accept the previous state and return a new array of Places
  setPlaces: React.Dispatch<React.SetStateAction<Place[]>>
  // refreshPlaces allows consumers to request places from the server (options: lat, lon)
  refreshPlaces?: (opts?: { lat?: number; lon?: number }) => Promise<void>
  // the last searched location (stored as [lon, lat]) when a location search was performed
  searchedLocation?: [number, number] | null
  setSearchedLocation?: (v: [number, number] | null) => void
  // whether a refresh is in progress
  loading?: boolean
  // load places along a route after boarding at a stop (places/downstream)
  loadDownstreamPlaces: (opts: DownstreamSelection & { distance?: number }) => Promise<void>
  // the stop + route the current places were loaded for, if any
  downstream: DownstreamSelection | null
  // stops along the selected route after the boarding stop, in route order
  downstreamStops: DownstreamStop[]
  // empty the places, forget the selected route and cancel any in-flight downstream request
  clearPlaces: () => void
  // category filter: which of the 8 major categories are shown (all on by default)
  enabledCategories: Set<PlaceCategoryId>
  toggleCategory: (id: PlaceCategoryId) => void
  // `places` narrowed to the enabled categories — what the panel and map display
  visiblePlaces: Place[]
  // place picked on the map that the list should scroll to and flash; cleared once handled
  highlightedPlaceId: string | null
  setHighlightedPlaceId: (id: string | null) => void
}

export type DownstreamSelection = {
  stopId: string
  routeId: string
  // for display only
  routeShortName?: string
  route?: BusRoute
  stopName?: string
}

export type DownstreamStop = {
  id: string
  name: string
  coords: [number, number]
  // bus ride time from the boarding stop
  travelTimeSec?: number
}

// Helper to normalize an upstream item into Place
const toPlace = (s: any): Place => ({
  id: String(s.id ?? s._id ?? s.place_id ?? s.name ?? Math.random()),
  name: s.name ?? s.title ?? s.properties?.name ?? s.place_name ?? s.label ?? 'Unknown',
  coords: s.coords || [s.longitude ?? s.lon ?? s.x ?? s.location?.coordinates?.[0] ?? 0, s.latitude ?? s.lat ?? s.y ?? s.location?.coordinates?.[1] ?? 0],
  category: s.category ?? undefined,
  group: categorizePlace(s.category),
})

//Create the context (solves the problem of prop drilling)
const PlacesContext = createContext<Ctx | undefined>(undefined)

export function PlacesProvider({ children }: { children: React.ReactNode }) {
  const [places, setPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(false)
  const [searchedLocation, setSearchedLocation] = useState<[number, number] | null>(null)
  const { searchedLocation: busSearchedLocation } = useBusStops() || {}
  const log = getLogger('PlacesProvider')
  const [downstream, setDownstream] = useState<DownstreamSelection | null>(null)
  const [downstreamStops, setDownstreamStops] = useState<DownstreamStop[]>([])
  const [enabledCategories, setEnabledCategories] = useState<Set<PlaceCategoryId>>(
    () => new Set(PLACE_CATEGORIES.map((c) => c.id)),
  )
  const visiblePlaces = places.filter((p) => enabledCategories.has(p.group))
  const [highlightedPlaceId, setHighlightedPlaceId] = useState<string | null>(null)

  function toggleCategory(id: PlaceCategoryId) {
    setEnabledCategories((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  // Incremented per downstream request so a slow earlier response can't overwrite a newer one
  const downstreamRequest = useRef(0)

  function clearPlaces() {
    downstreamRequest.current++
    setPlaces([])
    setDownstream(null)
    setDownstreamStops([])
    setLoading(false)
  }

  async function loadDownstreamPlaces({ distance = 250, ...selection }: DownstreamSelection & { distance?: number }) {
    const id = ++downstreamRequest.current
    setDownstream(selection)
    setPlaces([])
    setDownstreamStops([])
    setLoading(true)
    try {
      const epParams = new URLSearchParams({ stopId: selection.stopId, routeId: selection.routeId, distance: String(distance) })
      const url = `/api/stops?endpoint=${encodeURIComponent(`places/downstream?${epParams.toString()}`)}`
      const res = await fetch(url)
      if (!res.ok) throw new Error(await res.text())
      const raw = await res.json()
      if (id !== downstreamRequest.current) return
      if (raw?.error) log.warn('downstream places error', raw.error)
      // Response: { stops: [{ stopId, stopName, latitude, longitude, travelTimeSec, places: [...] }] }.
      // Each place may name its closestStopId/closestStopName/distanceToStopM; when it doesn't, use the
      // stop it's listed under and measure the walk ourselves.
      const stops: any[] = Array.isArray(raw?.stops) ? raw.stops : []
      const stopById = new Map(stops.map((s) => [s.stopId, s]))
      // Keyed by place id: the same place can be listed under several stops, keep the shortest walk.
      // A Map keeps each place at its first position, i.e. in order along the route.
      const byId = new Map<string, Place>()
      for (const stop of stops) {
        for (const p of Array.isArray(stop.places) ? stop.places : []) {
          const place = toPlace(p)
          const alight = stopById.get(p.closestStopId) ?? stop
          place.closestStopId = p.closestStopId ?? stop.stopId
          place.closestStopName = p.closestStopName ?? alight.stopName
          place.travelTimeSec = alight.travelTimeSec
          // No fallback: stops[] only lists stops that have places nearby, so its order can't be used to count stops
          place.stopsFromOrigin = typeof p.stopsFromOrigin === 'number' ? p.stopsFromOrigin : undefined
          place.distanceToStopM = p.distanceToStopM ?? (
            typeof alight.longitude === 'number' && typeof alight.latitude === 'number'
              ? haversineM(place.coords, [alight.longitude, alight.latitude])
              : undefined
          )
          const existing = byId.get(place.id)
          if (!existing || (place.distanceToStopM ?? Infinity) < (existing.distanceToStopM ?? Infinity)) {
            byId.set(place.id, place)
          }
        }
      }
      setPlaces([...byId.values()])
      setDownstreamStops(
        stops
          .filter((s) => typeof s.longitude === 'number' && typeof s.latitude === 'number')
          .map((s) => ({ id: s.stopId, name: s.stopName, coords: [s.longitude, s.latitude], travelTimeSec: s.travelTimeSec })),
      )
    } catch (err) {
      if (id === downstreamRequest.current) log.error('loadDownstreamPlaces error', err)
    } finally {
      if (id === downstreamRequest.current) setLoading(false)
    }
  }

  async function refreshPlaces(opts?: { lat?: number; lon?: number }) {
    setLoading(true)
    log.debug('refreshPlaces called with', opts)
    try {
      // Build the upstream path + query (client-side) and send it to the server for proxying.
      const endpointBase = 'places/nearest'
      const epParams = new URLSearchParams()
      if (typeof opts?.lat === 'number') epParams.set('latitude', String(opts.lat))
      if (typeof opts?.lon === 'number') epParams.set('longitude', String(opts.lon))
      const endpointFull = endpointBase + (epParams.toString() ? `?${epParams.toString()}` : '')

      const url = `/api/stops?endpoint=${encodeURIComponent(endpointFull)}`
      log.debug('refreshPlaces will fetch', url)
      const res = await fetch(url)
      if (!res.ok) throw new Error(await res.text())
      const raw = await res.json()
      log.debug('raw response snapshot:', Array.isArray(raw) ? raw.slice(0, 5) : (raw && typeof raw === 'object' ? Object.fromEntries(Object.entries(raw).slice(0,5)) : raw))
      let mapped: Place[] = []

      // Common container keys
      const candidates = Array.isArray(raw) ? raw
        : Array.isArray(raw.Places) ? raw.Places
        : Array.isArray(raw.places) ? raw.places
        : Array.isArray(raw.results) ? raw.results
        : Array.isArray(raw.data) ? raw.data
        : Array.isArray(raw.items) ? raw.items
        : Array.isArray(raw.features) ? raw.features
        : Array.isArray(raw.busStops) ? raw.busStops
        : null

      if (candidates) {
        mapped = candidates.map((s: any) => toPlace(s))
      } else {
        getLogger('PlacesProvider').warn('Unknown places payload — keys:', Object.keys(raw || {}), raw)
      }
      setPlaces(mapped)
      getLogger('PlacesProvider').debug('fetched', mapped.length, 'places')
      // record searched location when explicit lat/lon provided
      if (typeof opts?.lat === 'number' && typeof opts?.lon === 'number') {
        setSearchedLocation([opts.lon, opts.lat])
      }
    } catch (err) {
      getLogger('PlacesProvider').error('refreshPlaces error', err)
    } finally {
      setLoading(false)
    }
  }

  // Sync places to the bus stops searched location: when bus context sets a searchedLocation,
  // fetch places for that location so both lists show the same area.
  useEffect(() => {
    log.debug('busSearchedLocation changed', busSearchedLocation)
    if (!busSearchedLocation) return
    const [lon, lat] = busSearchedLocation
    // fire-and-forget; refreshPlaces handles its own errors
    ;(async () => {
      try {
        await refreshPlaces({ lat, lon })
        setSearchedLocation([lon, lat])
      } catch (err) {
        getLogger('PlacesProvider').warn('refreshPlaces on busSearchedLocation failed', err)
      }
    })()
  }, [busSearchedLocation])

  return (
    <PlacesContext.Provider value={{ places, setPlaces, refreshPlaces, loading, searchedLocation, setSearchedLocation, loadDownstreamPlaces, downstream, downstreamStops, clearPlaces, enabledCategories, toggleCategory, visiblePlaces, highlightedPlaceId, setHighlightedPlaceId }}>
      {children}
    </PlacesContext.Provider>
  )
}

export function usePlaces() {
  const ctx = useContext(PlacesContext)
  if (!ctx) throw new Error("usePlaces must be used inside PlacesProvider")
  return ctx
}