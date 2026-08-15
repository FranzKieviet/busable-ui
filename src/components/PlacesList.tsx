"use client"

import React, { useState, useRef } from "react"
import { List, ListItem, ListItemText, Divider, Button, TextField, Autocomplete, CircularProgress } from "@mui/material"
import { usePlaces } from "@/context/PlacesContext"
import type { Place } from "@/context/PlacesContext"

export default function PlacesList() {
  const { places } = usePlaces()


  return (
    <div>
      <div style={{ display: 'flex', gap: 8, flexDirection: 'column', marginBottom: 8 }}>
        <h3 style={{ margin: 0 }}>Places</h3>
      </div>
      {/* Lat/Lon inputs removed — search by address now handles location searches */}

      <Divider />
      <List>
        {places.length === 0 && (
          <ListItem>
            <ListItemText primary="No places to display." />
          </ListItem>
        )}
        {places.map((p: Place) => (
          <React.Fragment key={p.id}>
            <ListItem>
              <ListItemText primary={p.name} />
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>
    </div>
  )
}
