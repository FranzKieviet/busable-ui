"use client"

import { useRef, useEffect, useState } from "react"
import { useBusStops } from "@/context/BusStopsContext"
import { usePlaces } from "@/context/PlacesContext"
import * as maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import { getLogger } from '@/lib/logger'
import { PLACE_CATEGORY_BY_ID } from '@/lib/placeCategories'
import { routeColor } from './RouteBadge'

type Props = {
  center?: [number, number]
  zoom?: number
}

// Material "DirectionsBus" glyph
const BUS_ICON_PATH = 'M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17m9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5m1.5-6H6V6h12z'

type StopMarkerOptions = {
  onClick?: () => void
  color?: string
  size?: number
  popupText?: string
  // draw a bolder marker that stays above other markers (e.g. place dots)
  prominent?: boolean
}

// Bus stop marker: white bus icon in a colored circle (navy for nearby stops)
function addStopMarker(
  map: any,
  s: { coords: [number, number]; name: string },
  { onClick, color = '#1e3a8a', size = 26, popupText = s.name, prominent = false }: StopMarkerOptions = {},
) {
  const el = document.createElement('div')
  el.style.width = `${size}px`
  el.style.height = `${size}px`
  el.style.borderRadius = '50%'
  el.style.background = color
  el.style.border = prominent ? '3px solid white' : '2px solid white'
  el.style.boxShadow = prominent ? '0 0 0 2px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.5)' : '0 1px 4px rgba(0,0,0,0.4)'
  if (prominent) el.style.zIndex = '2'
  el.style.display = 'flex'
  el.style.alignItems = 'center'
  el.style.justifyContent = 'center'
  el.style.cursor = 'pointer'
  el.title = s.name
  const icon = Math.round(size * 0.58)
  el.innerHTML = `<svg viewBox="0 0 24 24" width="${icon}" height="${icon}" fill="white" aria-hidden="true"><path d="${BUS_ICON_PATH}"/></svg>`
  if (onClick) el.addEventListener('click', onClick)

  return new (maplibregl as any).Marker({ element: el })
    .setLngLat(s.coords)
    .setPopup(new (maplibregl as any).Popup({ offset: size / 2 + 3 }).setText(popupText))
    .addTo(map)
}

// Marker keys: nearby stops use the raw stop id; everything else is prefixed
const SEARCHED_KEY = '__searched_location'
const DOWNSTREAM_PREFIX = 'down:'
const isNearbyStopKey = (key: string) =>
  key !== SEARCHED_KEY && !key.startsWith('place:') && !key.startsWith(DOWNSTREAM_PREFIX)

// Default to UC Berkeley Campanile so the marker is visible by default
export default function Map({ center = [-122.2578, 37.8721], zoom = 15 }: Props) {
  const mapEl = useRef<HTMLDivElement | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)
  const mapRef = useRef<any>(null)
  const markersRef = useRef<Record<string, any>>({})
  const { stops, searchedLocation, setHighlightedStopId } = useBusStops()
  // Only places in the enabled categories are drawn on the map
  const { visiblePlaces: places, setHighlightedPlaceId, downstream, downstreamStops } = usePlaces()
  const cartoKey = process.env.NEXT_PUBLIC_CARTO_API_KEY



  useEffect(() => {
    if (!mapEl.current) return
    let map
    try {
      const styleObj = {
        version: 8,
        sources: {
          rasterTiles: {
            type: 'raster',
            // Carto Light with labels — shows street names
            tiles: [`https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png?key=${cartoKey}`],
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
      getLogger('Map').error('Map init error', err)
      setError(String(err?.message ?? err))
      return
    }

    map.on('error', (e: any) => {
      getLogger('Map').error('Map error', e)
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

    getLogger('Map').debug('places changed, count=', places?.length)

    // If there are places visible, hide stop markers to avoid clutter.
    if (places && places.length > 0) {
      getLogger('Map').debug('hiding stop markers because places present')
      // remove any existing nearby-stop markers
      Object.keys(markersRef.current).forEach((id) => {
        if (isNearbyStopKey(id)) {
          try { markersRef.current[id].remove() } catch (_) {}
          delete markersRef.current[id]
        }
      })
      return
    }

    const stopIds = new Set(stops.map((s) => s.id))

    // Add new markers for stops (only when places are not showing)
    stops.forEach((s) => {
      if (markersRef.current[s.id]) return
      markersRef.current[s.id] = addStopMarker(map, s, { onClick: () => setHighlightedStopId(s.id) })
    })

    // Remove markers for stops that no longer exist
    Object.keys(markersRef.current).forEach((id) => {
      if (!isNearbyStopKey(id)) return
      if (!stopIds.has(id)) {
        try { markersRef.current[id].remove() } catch (_) {}
        delete markersRef.current[id]
      }
    })
  }, [stops, places])

  // Render a red marker for the last searched location (if any).
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const key = SEARCHED_KEY
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
      try {
        // center the map on the searched location; prefer keeping current zoom if already zoomed in
        const currentZoom = typeof map.getZoom === 'function' ? map.getZoom() : undefined
        const targetZoom = typeof currentZoom === 'number' && currentZoom > 14 ? currentZoom : 15
        map.flyTo({ center: searchedLocation, zoom: targetZoom, essential: true })
      } catch (err) {
        getLogger('Map').warn('map center/flyTo failed', err)
      }
    }
  }, [searchedLocation])

  // Sync place markers: when places are present, render category-colored dots and remove stop markers.
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    // Remove existing place markers if places list is empty
    const placeKeys = Object.keys(markersRef.current).filter((k) => k.startsWith('place:'))
    if (!places || places.length === 0) {
      placeKeys.forEach((k) => {
        try { markersRef.current[k].remove() } catch (_) {}
        delete markersRef.current[k]
      })

      // Re-add stop markers if any stops exist (since we removed them when places showed)
      // Iterate `stops` from bus context and add markers if missing
      stops.forEach((s) => {
        if (markersRef.current[s.id]) return
        markersRef.current[s.id] = addStopMarker(map, s, { onClick: () => setHighlightedStopId(s.id) })
      })
      return
    }

    // When places exist, remove any nearby-stop markers to declutter
    Object.keys(markersRef.current).forEach((id) => {
      if (isNearbyStopKey(id)) {
        try { markersRef.current[id].remove() } catch (_) {}
        delete markersRef.current[id]
      }
    })

    // Remove markers for places that are gone or filtered out by category
    const placeIds = new Set(places.map((p) => `place:${p.id}`))
    placeKeys.forEach((k) => {
      if (placeIds.has(k)) return
      try { markersRef.current[k].remove() } catch (_) {}
      delete markersRef.current[k]
    })

    // Add place markers, colored by their major category
    places.forEach((p) => {
      const key = `place:${p.id}`
      if (markersRef.current[key]) return
      const el = document.createElement('div')
      el.style.width = '16px'
      el.style.height = '16px'
      el.style.borderRadius = '50%'
      el.style.background = PLACE_CATEGORY_BY_ID[p.group].color
      el.style.border = '2px solid white'
      el.style.boxShadow = '0 0 4px rgba(0,0,0,0.4)'
      el.title = p.name
      el.style.cursor = 'pointer'
      // reveal the place in the places panel
      el.addEventListener('click', () => setHighlightedPlaceId(p.id))

      const m = new (maplibregl as any).Marker({ element: el })
        .setLngLat(p.coords)
        .setPopup(new (maplibregl as any).Popup({ offset: 25 }).setText(p.name))
        .addTo(map)
      markersRef.current[key] = m
    })
  }, [places])

  // Downstream stops for the selected route: route-colored stop markers, and fit the map to the trip
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    // Replace whatever was drawn for the previous route
    Object.keys(markersRef.current).forEach((k) => {
      if (!k.startsWith(DOWNSTREAM_PREFIX)) return
      try { markersRef.current[k].remove() } catch (_) {}
      delete markersRef.current[k]
    })
    if (downstreamStops.length === 0) return

    const color = downstream?.route ? routeColor(downstream.route) : '#1e3a8a'
    downstreamStops.forEach((s) => {
      const ride = s.travelTimeSec != null ? ` · ${Math.max(1, Math.round(s.travelTimeSec / 60))} min ride` : ''
      markersRef.current[`${DOWNSTREAM_PREFIX}${s.id}`] = addStopMarker(map, s, {
        color,
        size: 30,
        prominent: true,
        popupText: `${s.name}${ride}`,
      })
    })

    // Show the whole trip: boarding stop (if it's in the nearby list) plus every downstream stop
    const origin = stops.find((s) => s.id === downstream?.stopId)
    const points = [...(origin ? [origin.coords] : []), ...downstreamStops.map((s) => s.coords)]
    try {
      const bounds = points.reduce(
        (b, p) => b.extend(p),
        new (maplibregl as any).LngLatBounds(points[0], points[0]),
      )
      // Extra side padding keeps the stops out from under the left and right panels (each ~410px incl.
      // offset), scaled down on narrow screens so the padding never exceeds the map
      const width = map.getContainer().clientWidth
      const side = Math.min(440, Math.max(20, width * 0.3))
      map.fitBounds(bounds, { padding: { top: 100, bottom: 80, left: side, right: side }, maxZoom: 16 })
    } catch (err) {
      getLogger('Map').warn('fitBounds for downstream stops failed', err)
    }
  }, [downstreamStops])

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
