"use client"

import React from "react"
import { Box, CircularProgress, Link, Stack, Typography } from "@mui/material"
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined"
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus"
import DirectionsTransitIcon from "@mui/icons-material/DirectionsTransit"
import OpenInNewIcon from "@mui/icons-material/OpenInNew"
import { usePlaces } from "@/context/PlacesContext"
import type { Place } from "@/context/PlacesContext"
import { useBusStops } from "@/context/BusStopsContext"
import type { BusRoute } from "@/context/BusStopsContext"
import { PLACE_CATEGORY_BY_ID } from "@/lib/placeCategories"
import { ListCard } from "./ListCard"
import RouteBadge, { routeColor } from "./RouteBadge"
import { useScrollToCard, SCROLL_SPACER_HEIGHT } from "@/lib/useScrollToCard"

type Props = {
  onSelect?: (p: Place) => void
}

// Average walking pace used for the walk from the stop to the place
const WALK_M_PER_MIN = 80
// Width of the left rail in the journey (matches the route badge)
const RAIL = 30

function formatDistance(m: number) {
  return m < 1000 ? `${Math.round(m / 10) * 10} m` : `${(m / 1000).toFixed(1)} km`
}

function formatMinutes(min: number) {
  if (min < 60) return `${min} min`
  return `${Math.floor(min / 60)} h ${min % 60} min`
}

// Bus ride to the closest stop + walk from it, in whole minutes (at least 1)
function tripTime(p: Place): { total: number; ride: number; walk: number } | null {
  if (p.travelTimeSec == null) return null
  const ride = p.travelTimeSec / 60
  const walk = p.distanceToStopM != null ? p.distanceToStopM / WALK_M_PER_MIN : 0
  return { total: Math.max(1, Math.round(ride + walk)), ride: Math.round(ride), walk: Math.round(walk) }
}

// Google Maps transit directions to the place. Coordinates are [lon, lat]; Google wants "lat,lng".
// Starts from the searched address when there is one, otherwise Google uses the user's location.
function googleTransitUrl(destination: [number, number], origin?: [number, number] | null) {
  const params = new URLSearchParams({ api: '1', destination: `${destination[1]},${destination[0]}`, travelmode: 'transit' })
  if (origin) params.set('origin', `${origin[1]},${origin[0]}`)
  return `https://www.google.com/maps/dir/?${params.toString()}`
}

function DirectionsLink({ place, origin }: { place: Place; origin?: [number, number] | null }) {
  return (
    <Link
      href={googleTransitUrl(place.coords, origin)}
      target="_blank"
      rel="noopener noreferrer"
      underline="hover"
      // don't also trigger the card's onSelect
      onClick={(e) => e.stopPropagation()}
      sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, mt: 0.5, color: '#42a5f5', fontSize: 14 }}
    >
      <DirectionsTransitIcon sx={{ fontSize: 16 }} />
      Open in Google Maps
      <OpenInNewIcon sx={{ fontSize: 13 }} />
    </Link>
  )
}

// Category icon in a circle of the category's color
function CategoryIcon({ place }: { place: Place }) {
  const { Icon, color, label } = PLACE_CATEGORY_BY_ID[place.group]
  return (
    <Box
      title={place.category ? `${label} · ${place.category.replace(/_/g, ' ')}` : label}
      sx={{ width: 30, height: 30, borderRadius: '50%', bgcolor: color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <Icon sx={{ fontSize: 17 }} />
    </Box>
  )
}

const STOP_NAVY = '#1e3a8a'

// Bus stop dot on the journey rail: outlined where you board, filled (like the map markers) where you get off
function StopDot({ filled }: { filled?: boolean }) {
  return (
    <Box sx={{ width: RAIL, display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
      <Box
        sx={{
          width: 22,
          height: 22,
          borderRadius: '50%',
          bgcolor: filled ? STOP_NAVY : '#fff',
          border: '2px solid',
          borderColor: filled ? '#fff' : STOP_NAVY,
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <DirectionsBusIcon sx={{ fontSize: 12, color: filled ? '#fff' : STOP_NAVY }} />
      </Box>
    </Box>
  )
}

function JourneyStop({ filled, name, caption }: { filled?: boolean; name: string; caption: string }) {
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
      <StopDot filled={filled} />
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
          {name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {caption}
        </Typography>
      </Box>
    </Stack>
  )
}

// Stop you board at, three dots (in the route's color) for the ride, then the stop to get off at
function Journey({ place, route, originName }: { place: Place; route: BusRoute; originName?: string }) {
  const color = routeColor(route)
  return (
    <Box sx={{ mt: 1.5 }}>
      <JourneyStop name={originName ?? 'Your stop'} caption="Get on" />

      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <Stack spacing={0.5} sx={{ width: RAIL, alignItems: 'center', py: 0.75, flexShrink: 0 }} aria-hidden>
          {[0, 1, 2].map((i) => (
            <Box key={i} sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: color }} />
          ))}
        </Stack>
        {place.stopsFromOrigin != null && (
          <Typography variant="caption" sx={{ color, fontWeight: 600 }}>
            {place.stopsFromOrigin} {place.stopsFromOrigin === 1 ? 'stop' : 'stops'}
          </Typography>
        )}
      </Stack>

      <JourneyStop
        filled
        name={place.closestStopName ?? 'Nearest stop'}
        caption={place.distanceToStopM != null ? `Get off · ${formatDistance(place.distanceToStopM)} walk` : 'Get off'}
      />
    </Box>
  )
}

// Space the title leaves for the corner: route badge (up to ~44px incl. direction pip) + gap + category icon
const CORNER_WIDTH = 86

type PlaceCardProps = {
  place: Place
  route?: BusRoute
  originName?: string
  onSelect?: (p: Place) => void
  cardRef?: (el: HTMLElement | null) => void
}

function PlaceCard({ place, route, originName, onSelect, cardRef }: PlaceCardProps) {
  const trip = tripTime(place)
  const { searchedLocation } = useBusStops()
  return (
    <ListCard
      title={place.name}
      corner={
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          {route && <RouteBadge route={route} />}
          <CategoryIcon place={place} />
        </Stack>
      }
      cornerWidth={route ? CORNER_WIDTH : 32}
      cardRef={cardRef}
      onClick={() => onSelect?.(place)}
    >
      <DirectionsLink place={place} origin={searchedLocation} />

      {/* Right padding keeps the journey clear of the trip time */}
      <Box sx={{ pr: 9 }}>{route && <Journey place={place} route={route} originName={originName} />}</Box>

      {trip && (
        <Box
          title={`${trip.ride} min ride + ${trip.walk} min walk`}
          sx={{ position: 'absolute', right: 16, bottom: 14, textAlign: 'right' }}
        >
          <Typography sx={{ fontWeight: 800, fontSize: 18, lineHeight: 1.1 }}>{formatMinutes(trip.total)}</Typography>
          <Typography variant="caption" color="text.secondary">
            ride + walk
          </Typography>
        </Box>
      )}
    </ListCard>
  )
}

export default function PlacesList({ onSelect }: Props) {
  const { places, visiblePlaces, loading, downstream, highlightedPlaceId, setHighlightedPlaceId } = usePlaces()
  // When a place is clicked on the map: scroll its card to the top of the panel and flash it
  const { cardRef, showSpacer } = useScrollToCard(highlightedPlaceId, clearHighlight, loading)

  function clearHighlight() {
    setHighlightedPlaceId(null)
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress size={28} />
      </Box>
    )
  }

  if (places.length === 0) {
    return (
      <Stack spacing={1} sx={{ alignItems: 'center', py: 4, color: 'text.secondary', textAlign: 'center' }}>
        <StorefrontOutlinedIcon sx={{ fontSize: 36, opacity: 0.6 }} />
        <Typography variant="body2">Pick a bus number on a stop to see places along that route.</Typography>
      </Stack>
    )
  }

  if (visiblePlaces.length === 0) {
    return (
      <Typography variant="body2" sx={{ py: 4, color: 'text.secondary', textAlign: 'center' }}>
        No places match the selected categories.
      </Typography>
    )
  }

  return (
    <Stack spacing={1.25}>
      {visiblePlaces.map((p) => (
        <PlaceCard
          key={p.id}
          place={p}
          route={downstream?.route}
          originName={downstream?.stopName}
          onSelect={onSelect}
          cardRef={cardRef(p.id)}
        />
      ))}
      {showSpacer && <Box aria-hidden sx={{ height: SCROLL_SPACER_HEIGHT }} />}
    </Stack>
  )
}
