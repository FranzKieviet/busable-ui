"use client"

import { useRef, useEffect, useState } from "react"
import { useBusStops } from "@/context/BusStopsContext"
import * as maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"

type Props = {
  center?: [number, number]
  zoom?: number
}

// Default to UC Berkeley Campanile so the marker is visible by default
export default function Map({ center = [-122.2578, 37.8721], zoom = 15 }: Props) {
  const mapEl = useRef<HTMLDivElement | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)
  const mapRef = useRef<any>(null)
  const markersRef = useRef<Record<string, any>>({})
  const { stops } = useBusStops()
  const { searchedLocation } = useBusStops()

  useEffect(() => {
    if (!mapEl.current) return
    let map
    try {
      // Inline raster style using OpenStreetMap tiles as a reliable fallback
      const styleObj = {
        version: 8,
        sources: {
          rasterTiles: {
            type: 'raster',
            // Carto Light with labels — shows street names
            tiles: ['https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'],
            tileSize: 256,
          },
        },
        layers: [
          {
            id: 'base-tiles',
            type: 'raster',
            source: 'rasterTiles',
          },
        ],
      }

      map = new (maplibregl as any).Map({
        container: mapEl.current,
        style: styleObj,
        center,
        zoom,
        attributionControl: false,
      })
    } catch (err: any) {
      console.error('Map init error', err)
      setError(String(err?.message ?? err))
      return
    }

    map.on('error', (e: any) => {
      console.error('Map error', e)
      setError('Map error — see console for details')
    })

    map.on('load', () => setLoaded(true))
    mapRef.current = map

    return () => {
      try {
        // remove any markers we created
        Object.values(markersRef.current).forEach((m) => m && m.remove && m.remove())
        markersRef.current = {}
        map.remove()
        mapRef.current = null
      } catch (_) {}
    }
  }, [center, zoom])

  // Sync markers with stops from context
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const existingIds = new Set(Object.keys(markersRef.current))
    const stopIds = new Set(stops.map((s) => s.id))

    // Add new markers
    stops.forEach((s) => {
      if (markersRef.current[s.id]) return
      const m = new (maplibregl as any).Marker()
        .setLngLat(s.coords)
        .setPopup(new (maplibregl as any).Popup({ offset: 25 }).setText(s.name))
        .addTo(map)
      markersRef.current[s.id] = m
    })

    // Remove markers for stops that no longer exist
    Object.keys(markersRef.current).forEach((id) => {
      if (!stopIds.has(id)) {
        try {
          markersRef.current[id].remove()
        } catch (_) {}
        delete markersRef.current[id]
      }
    })
  }, [stops])

  // Render a red marker for the last searched location (if any).
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const key = '__searched_location'
    // remove existing searched marker
    if (markersRef.current[key]) {
      try { markersRef.current[key].remove() } catch (_) {}
      delete markersRef.current[key]
    }

    if (searchedLocation && Array.isArray(searchedLocation)) {
      const el = document.createElement('div')
      el.style.width = '18px'
      el.style.height = '18px'
      el.style.borderRadius = '50%'
      el.style.background = 'red'
      el.style.border = '2px solid white'
      el.style.boxShadow = '0 0 4px rgba(0,0,0,0.4)'
      el.title = 'Searched location'

      const m = new (maplibregl as any).Marker({ element: el })
        .setLngLat(searchedLocation)
        .addTo(map)
      markersRef.current[key] = m
    }
  }, [searchedLocation])

  return (
    <div style={{ position: 'relative' }}>
      <div
        ref={mapEl}
        style={{ width: '100%', height: '100vh', minHeight: 300, borderRadius: 0 }}
      />
      {!loaded && !error && (
        <div style={{ position: 'absolute', left: 12, top: 12, background: 'rgba(255,255,255,0.9)', padding: 8, borderRadius: 6 }}>
          Loading map...
        </div>
      )}
      {error && (
        <div style={{ position: 'absolute', left: 12, top: 12, background: 'rgba(255,255,255,0.95)', padding: 8, borderRadius: 6, color: 'red' }}>
          {error}
        </div>
      )}
    </div>
  )
}
