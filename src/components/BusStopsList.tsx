"use client"

import React from "react"
import Image, { type StaticImageData } from "next/image"
import { Box, CircularProgress, Stack, Typography } from "@mui/material"
import DirectionsBusOutlinedIcon from "@mui/icons-material/DirectionsBusOutlined"
import { useBusStops } from "@/context/BusStopsContext"
import type { BusStop, BusRoute } from "@/context/BusStopsContext"
import { usePlaces } from "@/context/PlacesContext"
import { ListCard, CoordsLine } from "./ListCard"
import RouteBadge, { routeKey } from "./RouteBadge"
import { useScrollToCard, SCROLL_SPACER_HEIGHT } from "@/lib/useScrollToCard"
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

// The API can list the same route/direction more than once; show each bus number + direction once
function uniqueRoutes(routes: BusRoute[] = []): BusRoute[] {
  const seen = new Set<string>()
  return routes.filter((r) => !seen.has(routeKey(r)) && seen.add(routeKey(r)))
}

type CardProps = {
  stop: BusStop
  onSelect?: (s: BusStop) => void
  cardRef?: (el: HTMLElement | null) => void
}

function BusStopCard({ stop, onSelect, cardRef }: CardProps) {
  const routes = uniqueRoutes(stop.routes_served)
  const agencyLogo = stop.agency ? AGENCY_LOGOS[stop.agency] : undefined
  const { downstream, loadDownstreamPlaces } = usePlaces()

  return (
    <ListCard title={stop.name} cardRef={cardRef} onClick={() => onSelect?.(stop)}>
      <CoordsLine coords={stop.coords} />

      {/* Right padding keeps the badges clear of the agency logo slot */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25, mt: 1.5, pr: `${LOGO_SLOT + 8}px`, minHeight: LOGO_SLOT }}>
        {routes.map((r) => (
          <RouteBadge
            key={routeKey(r)}
            route={r}
            selected={downstream?.stopId === stop.id && downstream?.routeId === r.route_id}
            onClick={() => loadDownstreamPlaces({ stopId: stop.id, routeId: r.route_id, routeShortName: r.route_short_name, route: r, stopName: stop.name })}
          />
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
    </ListCard>
  )
}

export default function BusStopsList({ onSelect }: Props) {
  const { stops, loading, highlightedStopId, setHighlightedStopId } = useBusStops()
  // When a stop is clicked on the map: scroll its card to the top of the panel and flash it
  const { cardRef, showSpacer } = useScrollToCard(highlightedStopId, clearHighlight, loading)

  function clearHighlight() {
    setHighlightedStopId(null)
  }

  return (
    <Box sx={{ mt: 1 }}>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={28} />
        </Box>
      ) : stops.length === 0 ? (
        <Stack spacing={1} sx={{ alignItems: 'center', py: 4, color: 'text.secondary' }}>
          <DirectionsBusOutlinedIcon sx={{ fontSize: 36, opacity: 0.6 }} />
          <Typography variant="body2">Search a California address to see nearby bus stops.</Typography>
        </Stack>
      ) : (
        <Stack spacing={1.25}>
          {stops.map((s) => (
            <BusStopCard
              key={s.id}
              stop={s}
              onSelect={onSelect}
              cardRef={cardRef(s.id)}
            />
          ))}
          {showSpacer && <Box aria-hidden sx={{ height: SCROLL_SPACER_HEIGHT }} />}
        </Stack>
      )}
    </Box>
  )
}
