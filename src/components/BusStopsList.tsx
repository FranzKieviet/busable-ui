"use client"

import React, { useState, useRef } from "react"
import { List, ListItem, ListItemText, ListItemButton, Divider, Button, TextField, Autocomplete, CircularProgress } from "@mui/material"
import { useBusStops } from "@/context/BusStopsContext"
import type { BusStop } from "@/context/BusStopsContext"

type Props = {
  onSelect?: (s: BusStop) => void
}

export default function BusStopsList({ onSelect }: Props) {
  const { stops } = useBusStops()


  return (
    <div>
      <div style={{ display: 'flex', gap: 8, flexDirection: 'column', marginBottom: 8 }}>
        <h3 style={{ margin: 0 }}>Bus Stops</h3>
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
              <ListItemButton onClick={() => onSelect?.(s)}>
                <ListItemText primary={s.name} />
              </ListItemButton>
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>
    </div>
  )
}
