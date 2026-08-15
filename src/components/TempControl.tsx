"use client"
//TODO: REMOVE THIS FILE WHEN TESTING IS DONE
import React from "react"
import { List, ListItem, ListItemText, Divider, Button } from "@mui/material"
import { useBusStops } from "@/context/BusStopsContext"

export type BusStop = {
  id: string
  name: string
  coords: [number, number]
}

export default function TempControl() {
  const { stops, setStops } = useBusStops()

  function addMockStops() {
    const mock: BusStop[] = [
      { id: "1", name: "Campanile Stop", coords: [-122.2578, 37.8721] },
      { id: "2", name: "Sather Gate", coords: [-122.2585, 37.8716] },
      { id: "3", name: "Doe Library", coords: [-122.2594, 37.8728] },
    ]
    setStops((prev) => {
      // append, avoiding duplicate ids
      const existing = new Set(prev.map((p) => p.id))
      const toAdd = mock.filter((m) => !existing.has(m.id))
      return [...prev, ...toAdd]
    })
  }

  function removeMockStops() {
    setStops([])
}


  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <h3 style={{ margin: 0 }}>Temporary Control</h3>
        <Divider />
        <Button size="small" onClick={addMockStops}>Add stops</Button>
        <Button size="small" onClick={removeMockStops}>Remove stops</Button>
      </div>
      <Divider />
    </div>
  )
}
