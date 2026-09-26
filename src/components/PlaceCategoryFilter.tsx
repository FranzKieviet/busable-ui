"use client"

import React from "react"
import { Box, Chip } from "@mui/material"
import { usePlaces } from "@/context/PlacesContext"
import { PLACE_CATEGORIES } from "@/lib/placeCategories"

// Toggle chips for the 8 major place categories. Enabled categories show in the places panel and on the map.
export default function PlaceCategoryFilter() {
  const { places, enabledCategories, toggleCategory } = usePlaces()

  const counts: Record<string, number> = {}
  for (const p of places) counts[p.group] = (counts[p.group] ?? 0) + 1

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.5 }}>
      {PLACE_CATEGORIES.map(({ id, label, color, Icon }) => {
        const on = enabledCategories.has(id)
        const count = counts[id] ?? 0
        return (
          <Chip
            key={id}
            size="small"
            icon={<Icon />}
            label={places.length > 0 ? `${label} ${count}` : label}
            onClick={() => toggleCategory(id)}
            aria-pressed={on}
            variant={on ? 'filled' : 'outlined'}
            sx={{
              fontWeight: 600,
              ...(on
                ? { bgcolor: color, color: '#fff', '& .MuiChip-icon': { color: '#fff' }, '&:hover': { bgcolor: color, filter: 'brightness(0.92)' } }
                : { color: 'text.secondary', borderColor: 'divider', '& .MuiChip-icon': { color } }),
              // dim categories with nothing in the current results
              opacity: places.length > 0 && count === 0 ? 0.5 : 1,
            }}
          />
        )
      })}
    </Box>
  )
}
