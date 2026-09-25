"use client"

import React from "react"
import Image, { type StaticImageData } from "next/image"
import { Box, ButtonBase, CircularProgress, Stack, Typography } from "@mui/material"
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined"
import DirectionsBusOutlinedIcon from "@mui/icons-material/DirectionsBusOutlined"
import { useBusStops } from "@/context/BusStopsContext"
import type { BusStop, BusRoute } from "@/context/BusStopsContext"
import acTransitLogo from "@/assests/logos/ac-transit.webp"

// Agency slug (from the API's `agency` field) -> logo. Add new agencies here.
const AGENCY_LOGOS: Record<string, StaticImageData> = {
  'ac-transit': acTransitLogo,
}

type Props = {
  onSelect?: (s: BusStop) => void
}

// Size of the reserved bottom-right slot for the agency logo
const LOGO_SLOT = 40

// Fallback palette for routes that don't come with a route_color
const ROUTE_COLORS = ['#2563eb', '#16a34a', '#dc2626', '#9333ea', '#ea580c', '#0891b2', '#db2777', '#4f46e5', '#ca8a04', '#0d9488']

function routeColor(r: BusRoute): string {
  if (r.route_color) return r.route_color.startsWith('#') ? r.route_color : `#${r.route_color}`
  // Hash the short name so the same route always gets the same color
  let h = 0
  for (const c of r.route_short_name) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return ROUTE_COLORS[h % ROUTE_COLORS.length]
}

// A stop can list both directions of a route (e.g. 51B_0 and 51B_1); show each bus number once
function uniqueRoutes(routes: BusRoute[] = []): BusRoute[] {
  const seen = new Set<string>()
  return routes.filter((r) => !seen.has(r.route_short_name) && seen.add(r.route_short_name))
}

function RouteBadge({ route }: { route: BusRoute }) {
  const label = route.route_short_name
  return (
    <Box
      title={route.route_long_name}
      sx={{
        minWidth: 30,
        height: 30,
        px: label.length > 2 ? 0.75 : 0,
        borderRadius: 999,
        bgcolor: routeColor(route),
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
    </Box>
  )
}

function BusStopCard({ stop, onSelect }: { stop: BusStop; onSelect?: (s: BusStop) => void }) {
  const routes = uniqueRoutes(stop.routes_served)
  const [lon, lat] = stop.coords
  const agencyLogo = stop.agency ? AGENCY_LOGOS[stop.agency] : undefined

  return (
    <ButtonBase
      onClick={() => onSelect?.(stop)}
      sx={{
        display: 'block',
        width: '100%',
        textAlign: 'left',
        position: 'relative',
        p: 2,
        borderRadius: 3,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        transition: 'box-shadow 150ms, border-color 150ms, transform 150ms',
        '&:hover': {
          borderColor: 'primary.light',
          boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
          transform: 'translateY(-1px)',
        },
      }}
    >
      <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: 17, lineHeight: 1.3, pr: 1 }}>
        {stop.name}
      </Typography>

      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mt: 0.5, color: '#42a5f5' }}>
        <PlaceOutlinedIcon sx={{ fontSize: 16 }} />
        <Typography variant="body2" sx={{ fontVariantNumeric: 'tabular-nums' }}>
          {lat.toFixed(5)}, {lon.toFixed(5)}
        </Typography>
      </Stack>

      {/* Right padding keeps the badges clear of the agency logo slot */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1.5, pr: `${LOGO_SLOT + 8}px`, minHeight: LOGO_SLOT }}>
        {routes.map((r) => (
          <RouteBadge key={r.route_short_name} route={r} />
        ))}
      </Box>

      {agencyLogo && (
        <Box
          sx={{
            position: 'absolute',
            right: 16,
            bottom: 16,
            width: LOGO_SLOT,
            height: LOGO_SLOT,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Image
            src={agencyLogo}
            alt={stop.agency ?? 'Transit agency'}
            style={{ maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto', objectFit: 'contain' }}
          />
        </Box>
      )}
    </ButtonBase>
  )
}

export default function BusStopsList({ onSelect }: Props) {
  const { stops, loading } = useBusStops()

  return (
    <Box>
      <Stack direction="row" sx={{ alignItems: 'baseline', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Nearby Stops
        </Typography>
        {stops.length > 0 && (
          <Typography variant="caption" color="text.secondary">
            {stops.length} found
          </Typography>
        )}
      </Stack>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={28} />
        </Box>
      ) : stops.length === 0 ? (
        <Stack spacing={1} sx={{ alignItems: 'center', py: 4, color: 'text.secondary' }}>
          <DirectionsBusOutlinedIcon sx={{ fontSize: 36, opacity: 0.6 }} />
          <Typography variant="body2">Search an address to see nearby bus stops.</Typography>
        </Stack>
      ) : (
        <Stack spacing={1.25}>
          {stops.map((s) => (
            <BusStopCard key={s.id} stop={s} onSelect={onSelect} />
          ))}
        </Stack>
      )}
    </Box>
  )
}
