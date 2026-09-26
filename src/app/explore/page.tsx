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
        <Box sx={{ minHeight: "100vh", bgcolor: NAVY, color: "text.primary" }}>
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
