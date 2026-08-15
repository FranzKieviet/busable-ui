"use client"

import React, { useState } from "react"
import { List, ListItem, ListItemText, Divider, Button, TextField } from "@mui/material"
import { useBusStops } from "@/context/BusStopsContext"
import type { BusStop } from "@/context/BusStopsContext"

export default function BusStopsList() {
  const { stops, setStops, refreshStops, loading } = useBusStops()
  const [query, setQuery] = useState("")
  const [lat, setLat] = useState<string>("")
  const [lon, setLon] = useState<string>("")

  async function handleSearch() {
    if (refreshStops) await refreshStops({ q: query })
  }

  async function handleLocationSearch() {
    const nLat = parseFloat(lat)
    const nLon = parseFloat(lon)
    if (Number.isNaN(nLat) || Number.isNaN(nLon)) {
      // optionally show validation
      return
    }
    if (refreshStops) await refreshStops({ lat: nLat, lon: nLon })
  }

  function clearStops() {
    setStops([])
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
        <h3 style={{ margin: 0 }}>Bus Stops</h3>
        <TextField size="small" placeholder="Search stops" value={query} onChange={(e) => setQuery(e.target.value)} />
        <Button size="small" onClick={handleSearch} disabled={loading}>{loading ? 'Searching...' : 'Search'}</Button>
        <Button size="small" onClick={clearStops}>Clear</Button>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8, marginBottom: 8 }}>
        <TextField size="small" placeholder="Lat" value={lat} onChange={(e) => setLat(e.target.value)} />
        <TextField size="small" placeholder="Lon" value={lon} onChange={(e) => setLon(e.target.value)} />
        <Button size="small" onClick={handleLocationSearch} disabled={loading}>{loading ? 'Searching...' : 'Search by location'}</Button>
      </div>
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
              <ListItemText primary={s.name} secondary={`${s.coords[1].toFixed(4)}, ${s.coords[0].toFixed(4)}`} />
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>
    </div>
  )
}
