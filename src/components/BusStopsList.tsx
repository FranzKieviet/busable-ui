"use client"

import React, { useState, useRef } from "react"
import { List, ListItem, ListItemText, Divider, Button, TextField, Autocomplete, CircularProgress } from "@mui/material"
import { useBusStops } from "@/context/BusStopsContext"
import type { BusStop } from "@/context/BusStopsContext"

export default function BusStopsList() {
  const { stops, setStops, refreshStops, loading } = useBusStops()
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [suggestionsLoading, setSuggestionsLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [lastFetchError, setLastFetchError] = useState<string | null>(null)
  const [lastRequestUrl, setLastRequestUrl] = useState<string | null>(null)
  const [lastResponseText, setLastResponseText] = useState<string | null>(null)
  const fetchTimer = useRef<number | null>(null)
  // no local lat/lon inputs anymore; selection will call refreshStops with coords

  async function handleSearch() {
    if (refreshStops) await refreshStops({ q: query })
  }

  async function fetchSuggestions(text: string) {
    const key = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY
    if (!text || !key) {
      setSuggestions([])
      return
    }
    setSuggestionsLoading(true)
    try {
      const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(text)}&limit=6&format=json&lang=en&apiKey=${key}`
      setLastRequestUrl(url)
      setLastResponseText(null)
      setLastFetchError(null)
      const res = await fetch(url)
      const textRes = await res.text()
      setLastResponseText(textRes.slice(0, 2000))
      if (!res.ok) {
        setLastFetchError(`status:${res.status} ${res.statusText}`)
        setSuggestions([])
        return
      }
      const data = JSON.parse(textRes || '{}')
      // Geoapify returns either `features` (GeoJSON) or `results` (legacy/simple)
      const rawList = Array.isArray(data.features) ? data.features : Array.isArray(data.results) ? data.results : []
      const items = rawList.map((f: any) => {
        // Try GeoJSON geometry first
        const geom = f.geometry?.coordinates || (Array.isArray(f.geometry?.coordinates) ? f.geometry.coordinates : null)
        const lon = geom?.[0] ?? f.lon ?? f.longitude ?? f.properties?.lon
        const lat = geom?.[1] ?? f.lat ?? f.latitude ?? f.properties?.lat
        const rawLabel = f.properties?.formatted || f.formatted || f.properties?.name || f.name || f.address_line1 || f.city || text
        // Trim long trailing parts (country/postcode). Keep first up to 3 comma-separated segments.
        const displayLabel = rawLabel.split(',').map(s => s.trim()).filter(Boolean).slice(0, 2).join(', ')
        return { label: displayLabel, lon, lat }
      })
      setSuggestions(items)
      setOpen(items.length > 0)
    } catch (err: any) {
      const msg = String(err?.message || err)
      console.warn('geoapify suggestions error', msg)
      setLastFetchError(msg)
      setSuggestions([])
    } finally {
      setSuggestionsLoading(false)
    }
  }

  function clearStops() {
    setStops([])
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, flexDirection: 'column', marginBottom: 8 }}>
        <h3 style={{ margin: 0 }}>Bus Stops</h3>
        <div style={{ flex: 1 }}>
          <Autocomplete
            freeSolo
            open={open}
            onOpen={() => setOpen(true)}
            onClose={() => setOpen(false)}
            filterOptions={(opts) => opts}
            options={suggestions}
            autoHighlight
            autoComplete
            getOptionLabel={(opt) => (typeof opt === 'string' ? opt : opt.label || '')}
            onInputChange={(e, value) => {
              setQuery(value)
              if (fetchTimer.current) window.clearTimeout(fetchTimer.current)
              fetchTimer.current = window.setTimeout(() => fetchSuggestions(value), 300)
              if (value === '') setOpen(false)
            }}
            onChange={(_, value) => {
              const sel = value as any
              setOpen(false)
              if (sel && sel.lat && sel.lon) {
                if (refreshStops) refreshStops({ lat: sel.lat, lon: sel.lon })
              }
            }}
            renderOption={(props, option: any) => (
              <li {...props} key={`${option.label}-${option.lat}-${option.lon}`}>
                <div>
                  <div style={{ fontSize: 13 }}>{option.label}</div>
                </div>
              </li>
            )}
            renderInput={(params) => {
              const pAny = params as any
              return (
                <TextField
                  {...(pAny as any)}
                  size="small"
                  placeholder="Search by address"
                  InputProps={{
                    ...(pAny.InputProps || {}),
                    endAdornment: (
                      <>
                        {suggestionsLoading ? <CircularProgress color="inherit" size={16} /> : null}
                        {pAny.InputProps?.endAdornment}
                      </>
                    ),
                  } as any}
                  fullWidth
                />
              )
            }}
          />
        </div>
      </div>
      {/* Lat/Lon inputs removed — search by address now handles location searches */}

      <Divider />
      <List>
        {stops.length === 0 && (
          <ListItem>
            <ListItemText primary="No stops to display." />
          </ListItem>
        )}
        {stops.map((s: BusStop) => (
          <React.Fragment key={s.id}>
            <ListItem>
              <ListItemText primary={s.name} />
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>
    </div>
  )
}
