"use client"

import React from "react"
import { Box, ButtonBase } from "@mui/material"
import NorthEastIcon from "@mui/icons-material/NorthEast"
import SouthWestIcon from "@mui/icons-material/SouthWest"
import type { BusRoute } from "@/context/BusStopsContext"

// Fallback palette for routes that don't come with a route_color
const ROUTE_COLORS = ['#2563eb', '#16a34a', '#dc2626', '#9333ea', '#ea580c', '#0891b2', '#db2777', '#4f46e5', '#ca8a04', '#0d9488']

export function routeColor(r: BusRoute): string {
  if (r.route_color) return r.route_color.startsWith('#') ? r.route_color : `#${r.route_color}`
  // Hash the short name so the same route always gets the same color
  let h = 0
  for (const c of r.route_short_name) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return ROUTE_COLORS[h % ROUTE_COLORS.length]
}

const DIRECTION_LABELS = { 0: 'Outbound', 1: 'Inbound' } as const

export const routeKey = (r: BusRoute) => `${r.route_short_name}:${r.direction ?? ''}`

type BadgeProps = {
  route: BusRoute
  selected?: boolean
  // without onClick the badge is display-only
  onClick?: () => void
}

// Colored bus-number circle with a direction pip (↗ outbound, ↙ inbound)
export default function RouteBadge({ route, selected, onClick }: BadgeProps) {
  const label = route.route_short_name
  const color = routeColor(route)
  const direction = route.direction != null ? DIRECTION_LABELS[route.direction] : undefined
  const DirectionIcon = route.direction === 0 ? NorthEastIcon : SouthWestIcon
  return (
    <ButtonBase
      title={[label, direction, route.route_long_name].filter(Boolean).join(' · ')}
      aria-pressed={onClick ? selected : undefined}
      // display-only badges render as a plain span so they aren't focusable buttons
      component={onClick ? 'button' : 'span'}
      disableRipple={!onClick}
      onClick={
        onClick &&
        ((e: React.MouseEvent) => {
          // don't also trigger the card's onSelect
          e.stopPropagation()
          onClick()
        })
      }
      sx={{
        position: 'relative',
        flexShrink: 0,
        transition: 'transform 120ms',
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? { transform: 'scale(1.08)' } : undefined,
        // ring around the route whose places are showing in the right panel
        outline: selected ? `2px solid ${color}` : 'none',
        outlineOffset: 2,
        minWidth: 30,
        height: 30,
        px: label.length > 2 ? 0.75 : 0,
        borderRadius: 999,
        bgcolor: color,
        color: '#fff',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: label.length > 3 ? 11 : 12,
        fontWeight: 700,
        lineHeight: 1,
        boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
      }}
    >
      {label}
      {direction && (
        <Box
          aria-label={direction}
          sx={{
            position: 'absolute',
            right: -4,
            bottom: -4,
            width: 15,
            height: 15,
            borderRadius: '50%',
            bgcolor: '#fff',
            border: '1.5px solid',
            borderColor: color,
            color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <DirectionIcon sx={{ fontSize: 10 }} />
        </Box>
      )}
    </ButtonBase>
  )
}
