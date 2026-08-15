"use client"

import React, { useState, useRef } from "react"
import { TextField, Autocomplete, CircularProgress } from "@mui/material"
import { useBusStops } from "@/context/BusStopsContext"

export default function AddressSearch() {
  const { refreshStops } = useBusStops()
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [suggestionsLoading, setSuggestionsLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const fetchTimer = useRef<number | null>(null)

  async function fetchSuggestions(text: string) {
    const key = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY
    if (!text || !key) {
      setSuggestions([])
      return
    }
    setSuggestionsLoading(true)
    try {
      const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(text)}&limit=6&format=json&lang=en&apiKey=${key}`
      const res = await fetch(url)
      const textRes = await res.text()
      if (!res.ok) {
        setSuggestions([])
        return
      }
      const data = JSON.parse(textRes || '{}')
      const rawList = Array.isArray(data.features) ? data.features : Array.isArray(data.results) ? data.results : []
      const items = rawList.map((f: any) => {
        const geom = f.geometry?.coordinates || (Array.isArray(f.geometry?.coordinates) ? f.geometry.coordinates : null)
        const lon = geom?.[0] ?? f.lon ?? f.longitude ?? f.properties?.lon
        const lat = geom?.[1] ?? f.lat ?? f.latitude ?? f.properties?.lat
        const rawLabel = f.properties?.formatted || f.formatted || f.properties?.name || f.name || f.address_line1 || f.city || text
        const displayLabel = rawLabel.split(',').map((s: string) => s.trim()).filter(Boolean).slice(0, 2).join(', ')
        return { label: displayLabel, lon, lat }
      })
      setSuggestions(items)
      setOpen(items.length > 0)
    } catch (err) {
      console.warn('geoapify suggestions error', err)
      setSuggestions([])
    } finally {
      setSuggestionsLoading(false)
    }
  }

  return (
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
      renderInput={(params) => (
  <TextField
    {...params}
    size="small"
    placeholder="Search by address"
    fullWidth
  />
)}
    />
  )
}
