"use client"

import React, { useState, useRef } from "react"
import { TextField, Autocomplete, CircularProgress, IconButton } from "@mui/material"
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined"
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined"
import { useBusStops } from "@/context/BusStopsContext"
import { usePlaces } from '@/context/PlacesContext'
import { getLogger } from '@/lib/logger'

// Suggestions are limited to California:
// - GEOAPIFY_CALIFORNIA is Geoapify's place_id for the state of California (from
//   /v1/geocode/search?text=California&type=state&filter=countrycode:us); `filter=place:` keeps
//   results inside its boundary
// - results are also checked for state_code "CA", since the boundary filter lets a few near-border
//   results through
// - `bias` ranks results near the map's default center (Berkeley) first
const GEOAPIFY_CALIFORNIA = '51f1b73d4162b05dc059e6ecf88ac9594240f00101f9016386020000000000c0020a92030a43616c69666f726e6961'
const SEARCH_BIAS: [number, number] = [-122.2578, 37.8721] // [lon, lat]
const MAX_SUGGESTIONS = 6

export type AddressSuggestion = { label: string; lat: number; lon: number }

type AddressSearchProps = {
  mode?: 'stops' | 'places' | 'both'
  // When set, a picked address is handed to this instead of loading stops/places here
  onPick?: (s: AddressSuggestion) => void
  // Text to show in the box initially (e.g. an address passed in from another page)
  initialQuery?: string
  // 'panel': compact field for the map overlay. 'hero': large pill with an arrow button (welcome page).
  variant?: 'panel' | 'hero'
  placeholder?: string
  // hero only: arrow clicked with no suggestion to pick (e.g. nothing typed yet)
  onSubmitEmpty?: () => void
}

export default function AddressSearch({
  mode = 'both',
  onPick,
  initialQuery = '',
  variant = 'panel',
  placeholder = 'Search by address',
  onSubmitEmpty,
}: AddressSearchProps) {
  const { refreshStops, setStops, setSearchedLocation } = useBusStops()
  const { refreshPlaces, clearPlaces } = usePlaces()
  const [query, setQuery] = useState(initialQuery)
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [suggestionsLoading, setSuggestionsLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const fetchTimer = useRef<number | null>(null)
  // Incremented per request (and on selection) so late responses can't reopen the dropdown
  const requestId = useRef(0)

  async function fetchSuggestions(text: string) {
    const id = ++requestId.current
    const key = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY
    if (!text || !key) {
      setSuggestions([])
      return
    }
    setSuggestionsLoading(true)
    try {
      const params = new URLSearchParams({
        text,
        // ask for extra so there are still enough after dropping non-California results
        limit: '10',
        format: 'json',
        lang: 'en',
        filter: `place:${GEOAPIFY_CALIFORNIA}`,
        bias: `proximity:${SEARCH_BIAS[0]},${SEARCH_BIAS[1]}`,
        apiKey: key,
      })
      const url = `https://api.geoapify.com/v1/geocode/autocomplete?${params.toString()}`
      const res = await fetch(url)
      const textRes = await res.text()
      if (id !== requestId.current) return
      if (!res.ok) {
        setSuggestions([])
        return
      }
      const data = JSON.parse(textRes || '{}')
      const rawList = Array.isArray(data.features) ? data.features : Array.isArray(data.results) ? data.results : []
      const inCalifornia = rawList.filter((f: any) => (f.properties?.state_code ?? f.state_code) === 'CA')
      const items = inCalifornia.slice(0, MAX_SUGGESTIONS).map((f: any) => {
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
      if (id === requestId.current) setSuggestionsLoading(false)
    }
  }

  // Clear whatever this search box populates. Places are always cleared: they're either
  // searched here or loaded from a route on one of the stops being cleared.
  function clearResults() {
    // with onPick, results live elsewhere (e.g. on the next page), so there's nothing to clear here
    if (onPick) return
    if (mode === 'stops' || mode === 'both') {
      setStops([])
      if (setSearchedLocation) setSearchedLocation(null)
    }
    clearPlaces()
  }

  async function handleSelect(_e: any, value: any) {
    // Enter on typed text (no option highlighted) arrives as a string: use the top suggestion
    const sel = typeof value === 'string' ? suggestions[0] : value
    // Cancel any pending or in-flight suggestion lookup so it can't reopen the list
    if (fetchTimer.current) window.clearTimeout(fetchTimer.current)
    requestId.current++
    setSuggestionsLoading(false)
    setOpen(false)
    if (sel && sel.lat != null && sel.lon != null) {
      const latNum = Number(sel.lat)
      const lonNum = Number(sel.lon)
      getLogger('AddressSearch').debug('selection', { lat: sel.lat, lon: sel.lon, latNum, lonNum })
      if (typeof value === 'string') setQuery(sel.label)
      if (onPick) {
        onPick({ label: sel.label, lat: latNum, lon: lonNum })
        return
      }
      const promises: Promise<any>[] = []
      const shouldRefreshStops = mode === 'stops' || mode === 'both'
      const shouldRefreshPlaces = mode === 'places' || mode === 'both'
      if (shouldRefreshStops && refreshStops) promises.push(refreshStops({ lat: latNum, lon: lonNum }))
      if (shouldRefreshPlaces && refreshPlaces) promises.push(refreshPlaces({ lat: latNum, lon: lonNum }))
      if (promises.length > 0) await Promise.allSettled(promises)
    }
  }

  const hero = variant === 'hero'

  // hero arrow: pick the top suggestion, or hand off when there's nothing to pick
  function submit() {
    if (suggestions[0]) handleSelect(null, suggestions[0])
    else onSubmitEmpty?.()
  }

  return (
    <Autocomplete
      freeSolo
      inputValue={query}
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      filterOptions={(opts) => opts}
      options={suggestions}
      autoHighlight
      autoComplete
      getOptionLabel={(opt) => (typeof opt === 'string' ? opt : opt.label || '')}
      onInputChange={(_e, value, reason) => {
        setQuery(value)
        if (value === '') {
          // Search cleared (X button or text deleted): drop pending lookups and clear the results
          if (fetchTimer.current) window.clearTimeout(fetchTimer.current)
          requestId.current++
          setSuggestions([])
          setOpen(false)
          clearResults()
          return
        }
        // Only look up suggestions for typed text; selecting an option also fills the input
        if (reason !== 'input') return
        if (fetchTimer.current) window.clearTimeout(fetchTimer.current)
        fetchTimer.current = window.setTimeout(() => fetchSuggestions(value), 300)
      }}
      onChange={handleSelect}
      renderOption={(props, option: any) => (
        <li {...props} key={`${option.label}-${option.lat}-${option.lon}`}>
          <div>
            <div style={{ fontSize: 13 }}>{option.label}</div>
          </div>
        </li>
      )}
      renderInput={(params) =>
        hero ? (
          <TextField
            {...params}
            placeholder={placeholder}
            fullWidth
            slotProps={{
              ...params.slotProps,
              input: {
                ...params.slotProps.input,
                startAdornment: (
                  <>
                    <SearchOutlinedIcon sx={{ color: HERO_NAVY, ml: 1 }} />
                    {params.slotProps.input.startAdornment}
                  </>
                ),
                endAdornment: (
                  <>
                    {params.slotProps.input.endAdornment}
                    <IconButton
                      aria-label="Search"
                      onClick={submit}
                      sx={{ bgcolor: HERO_NAVY, color: '#fff', width: 38, height: 38, '&:hover': { bgcolor: '#16356e' } }}
                    >
                      <ArrowForwardOutlinedIcon fontSize="small" />
                    </IconButton>
                  </>
                ),
              },
            }}
            sx={heroFieldSx}
          />
        ) : (
          <TextField
            {...params}
            size="small"
            placeholder={placeholder}
            fullWidth
          />
        )
      }
    />
  )
}

const HERO_NAVY = '#0a1f44'

// Large off-white pill used on the welcome page
const heroFieldSx = {
  '& .MuiOutlinedInput-root': {
    // room on the right for the clear (x) button plus the arrow
    pl: 1.5,
    pr: '8px !important',
    py: '6px !important',
    borderRadius: 999,
    bgcolor: '#eef2f8',
    color: '#1f2a44',
    fontSize: { xs: 15, sm: 17 },
    boxShadow: '0 6px 18px rgba(0,0,0,0.22)',
    transition: 'box-shadow 150ms, background-color 150ms',
    '& fieldset': { borderColor: 'rgba(10,31,68,0.08)' },
    '&:hover': { bgcolor: '#f6f8fc' },
    '&:hover fieldset': { borderColor: 'rgba(10,31,68,0.15)' },
    '&.Mui-focused': { bgcolor: '#f6f8fc', boxShadow: '0 10px 24px rgba(0,0,0,0.3), 0 0 0 3px rgba(92,200,255,0.35)' },
    '&.Mui-focused fieldset': { borderColor: 'transparent' },
  },
  '& .MuiAutocomplete-endAdornment': { position: 'static', display: 'flex', alignItems: 'center', gap: 0.5, transform: 'none' },
  '& input::placeholder': { color: '#4a5670', opacity: 1 },
} as const
