"use client"

import OverlayBox from "./OverlayBox"
import AddressSearch from "./AddressSearch"
import BusStopsList from "./BusStopsList"
import PlacesList from "./PlacesList"
import { useBusStops } from "@/context/BusStopsContext"
import { usePlaces } from "@/context/PlacesContext"
import { useState } from "react"

type DisplayKind = 'stops' | 'places' | 'routes'

export default function LeftOverlay() {
  const { setStops, setSearchedLocation, searchedLocation } = useBusStops()
  const { setPlaces, refreshPlaces } = usePlaces()
  const [displayItems, setDisplayItems] = useState<DisplayKind>('stops')
    

  function handleClose() {
    // clear stops and searched location when overlay close is clicked
    setStops([])
    setPlaces([])
    if (setSearchedLocation) setSearchedLocation(null)
  }

  return (
    <OverlayBox
      left={50}
      top={80}
      bottom={50}
      width={360}
      ariaLabel="left-overlay"
      onBusStopsClick={() => setDisplayItems('stops')}
      onLocateClick={async () => {
        // Use the bus stops' searched location (from the search bar) to fetch places
        setDisplayItems('places')
        if (!searchedLocation) {
          console.warn('No searched location available; use the search bar to pick a location')
          return
        }
        const [lon, lat] = searchedLocation
        try {
          if (refreshPlaces) await refreshPlaces({ lat, lon })
        } catch (err) {
          console.error('refreshPlaces failed on locate click', err)
        }
      }}
      onCloseClick={handleClose}
    >
      <div style={{ marginBottom: 8 }}>
        <AddressSearch />
      </div>

      <div>
        {displayItems === 'stops' && <BusStopsList onSelect={(s) => { /* call refreshStops, setSearchedLocation */ }} />}
        {displayItems === 'places' && <PlacesList onSelect={(p) => { /* call refreshPlaces, setSearchedLocation */ }} />}
        {displayItems === 'routes' && <div>Routes content...</div>}
      </div>
    </OverlayBox>
  )
}
