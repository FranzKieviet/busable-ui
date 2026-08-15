"use client"

import React from "react"
import { List, ListItem, ListItemText, Divider, Button } from "@mui/material"
import { useBusStops } from "@/context/BusStopsContext"

export type BusStop = {
  id: string
  name: string
  coords: [number, number]
}

export default function BusStopsList() {
  const { stops } = useBusStops()

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h3 style={{ margin: 0 }}>Bus Stops</h3>
      </div>
      <Divider />
      <List>
        {stops.length === 0 && (
          <ListItem>
            <ListItemText primary="No stops could be found within 500 meters of the address you provided." />
          </ListItem>
        )}
        {stops.map((s) => (
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
