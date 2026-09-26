"use client"

import OverlayBox from "./OverlayBox"
import PlacesList from "./PlacesList"
import PlaceCategoryFilter from "./PlaceCategoryFilter"
import { usePlaces } from "@/context/PlacesContext"

export default function RightOverlay() {
  const { places, visiblePlaces, downstream } = usePlaces()

  // e.g. "via 51B · 42 of 247"
  const aside = [
    downstream?.routeShortName && `via ${downstream.routeShortName}`,
    places.length > 0 && (visiblePlaces.length === places.length ? `${places.length} found` : `${visiblePlaces.length} of ${places.length}`),
  ].filter(Boolean).join(' · ')

  return (
    <OverlayBox
      right={50}
      top={80}
      bottom={50}
      width={360}
      ariaLabel="right-overlay"
      title="Places"
      titleAside={aside || undefined}
    >
      <PlaceCategoryFilter />
      <PlacesList />
    </OverlayBox>
  )
}
