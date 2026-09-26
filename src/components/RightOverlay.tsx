"use client"

import OverlayBox from "./OverlayBox"
import PlacesList from "./PlacesList"

export default function RightOverlay() {
  return (
    <OverlayBox
      right={50}
      top={80}
      bottom={50}
      width={360}
      ariaLabel="right-overlay"
      title="Places"
    >
      <PlacesList />
    </OverlayBox>
  )
}
