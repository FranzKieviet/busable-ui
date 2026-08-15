"use client" //This is used to ensure hooks like useStae/useContext run in the browser which is important becuase the context is a mutable runtime state

import React, { createContext, useContext, useState, useEffect } from "react"
import { useBusStops } from './BusStopsContext'

export type Place = {
  id: string
  name: string
  coords: [number, number]
  // optional fields returned by the upstream API
  distanceM?: number
  routes?: string[]
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
}

//Create the context (solves the problem of prop drilling)
const PlacesContext = createContext<Ctx | undefined>(undefined)

export function PlacesProvider({ children }: { children: React.ReactNode }) {
  const [places, setPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(false)
  const [searchedLocation, setSearchedLocation] = useState<[number, number] | null>(null)
  const { searchedLocation: busSearchedLocation } = useBusStops() || {}

  async function refreshPlaces(opts?: { lat?: number; lon?: number }) {
    setLoading(true)
    try {
      // Build the upstream path + query (client-side) and send it to the server for proxying.
      const endpointBase = 'places/nearest'
      const epParams = new URLSearchParams()
      if (typeof opts?.lat === 'number') epParams.set('latitude', String(opts.lat))
      if (typeof opts?.lon === 'number') epParams.set('longitude', String(opts.lon))
      const endpointFull = endpointBase + (epParams.toString() ? `?${epParams.toString()}` : '')

      const url = `/api/stops?endpoint=${encodeURIComponent(endpointFull)}`
      const res = await fetch(url)
      if (!res.ok) throw new Error(await res.text())
      const raw = await res.json()
      let mapped: Place[] = []

      // Helper to normalize an upstream item into Place
      const toPlace = (s: any): Place => ({
        id: String(s.id ?? s._id ?? s.place_id ?? s.name ?? Math.random()),
        name: s.name ?? s.title ?? s.properties?.name ?? s.place_name ?? s.label ?? 'Unknown',
        coords: s.coords || [s.longitude ?? s.lon ?? s.x ?? s.location?.coordinates?.[0] ?? 0, s.latitude ?? s.lat ?? s.y ?? s.location?.coordinates?.[1] ?? 0],
      })

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
        console.warn('Unknown places payload — keys:', Object.keys(raw || {}), raw)
      }
      setPlaces(mapped)
      console.debug('[PlacesProvider] fetched', mapped.length, 'places')
      // record searched location when explicit lat/lon provided
      if (typeof opts?.lat === 'number' && typeof opts?.lon === 'number') {
        setSearchedLocation([opts.lon, opts.lat])
      }
    } catch (err) {
      console.error('refreshPlaces error', err)
    } finally {
      setLoading(false)
    }
  }

  // Sync places to the bus stops searched location: when bus context sets a searchedLocation,
  // fetch places for that location so both lists show the same area.
  useEffect(() => {
    if (!busSearchedLocation) return
    const [lon, lat] = busSearchedLocation
    // fire-and-forget; refreshPlaces handles its own errors
    ;(async () => {
      try {
        await refreshPlaces({ lat, lon })
        setSearchedLocation([lon, lat])
      } catch (err) {
        console.warn('PlacesProvider: refreshPlaces on busSearchedLocation failed', err)
      }
    })()
  }, [busSearchedLocation])

  return (
    <PlacesContext.Provider value={{ places, setPlaces, refreshPlaces, loading, searchedLocation, setSearchedLocation }}>
      {children}
    </PlacesContext.Provider>
  )
}

export function usePlaces() {
  const ctx = useContext(PlacesContext)
  if (!ctx) throw new Error("usePlaces must be used inside PlacesProvider")
  return ctx
}