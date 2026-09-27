"use client";

import { Suspense } from "react";
import { Box } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import Navbar from "@/components/Navbar";
import Map from "@/components/Map";
import LeftOverlay from "@/components/LeftOverlay";
import RightOverlay from "@/components/RightOverlay";
import { BusStopsProvider } from "@/context/BusStopsContext";
import { exploreTheme, NAVY } from "@/theme";

export default function Home() {
  return (
    // Dark navy scheme to match the welcome page
    <ThemeProvider theme={exploreTheme}>
      <BusStopsProvider>
        <Box
          sx={{
            minHeight: "100vh",
            bgcolor: NAVY,
            color: "text.primary",
            // Map popups have a white background; without this they'd inherit the page's white text
            "& .maplibregl-popup-content": {
              color: NAVY,
              fontWeight: 600,
              fontSize: 13,
              borderRadius: "8px",
              // extra right padding leaves room for the close button
              padding: "8px 28px 8px 12px",
              boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
            },
            "& .maplibregl-popup-close-button": {
              color: NAVY,
              fontSize: 18,
              lineHeight: 1,
              top: 4,
              right: 6,
              borderRadius: "4px",
              "&:hover": { bgcolor: "rgba(10,31,68,0.08)" },
            },
            // above all markers, including the home icon and route pin (z-index up to 3)
            "& .maplibregl-popup": { zIndex: 10 },
          }}
        >
          <Navbar title="Busable" titleColor={NAVY} />

          <Map center={[-122.2578, 37.8721]} zoom={15} />

          {/* Left overlay to display Bus Stops. Suspense is required because it reads the URL's
              search params (an address passed from the welcome page). */}
          <Suspense fallback={null}>
            <LeftOverlay />
          </Suspense>

          {/* Right overlay to display Places */}
          <RightOverlay />
        </Box>
      </BusStopsProvider>
    </ThemeProvider>
  );
}
