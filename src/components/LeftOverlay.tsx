"use client"

import OverlayBox from "./OverlayBox"
import AddressSearch from "./AddressSearch"
import BusStopsList from "./BusStopsList"
import { useBusStops } from "@/context/BusStopsContext"
import { FormControlLabel, Switch, Typography } from "@mui/material"

export default function LeftOverlay() {
  const { stops, searchedLocation, refreshStops, uniqueOnly, setUniqueOnly } = useBusStops()

  return (
    <OverlayBox
      left={50}
      top={80}
      bottom={50}
      width={360}
      ariaLabel="left-overlay"
      title="Nearby Stops"
      titleAside={stops.length > 0 ? `${stops.length} found` : undefined}
    >
      <div style={{ marginBottom: 8 }}>
        <AddressSearch mode="stops" />
        <FormControlLabel
          sx={{ mt: 0.5, ml: 0 }}
          label={<Typography variant="body2">Unique routes only</Typography>}
          control={
            <Switch
              size="small"
              checked={uniqueOnly}
              onChange={(e) => {
                const value = e.target.checked
                setUniqueOnly(value)
                // Re-run the current search so the list reflects the new setting
                if (searchedLocation && refreshStops) {
                  const [lon, lat] = searchedLocation
                  refreshStops({ lat, lon, uniqueOnly: value })
                }
              }}
            />
          }
        />
      </div>

      <BusStopsList />
    </OverlayBox>
  )
}
