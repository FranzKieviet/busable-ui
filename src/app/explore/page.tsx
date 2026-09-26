"use client";

import { Suspense } from "react";
import { Container, Box } from "@mui/material";
import Navbar from "@/components/Navbar";
import Map from "@/components/Map";
import LeftOverlay from "@/components/LeftOverlay";
import RightOverlay from "@/components/RightOverlay";
import { BusStopsProvider } from "@/context/BusStopsContext";
export default function Home() {
  return (
    <BusStopsProvider>
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #ffffff, #0099D8)",
        }}
      >
      <Navbar />

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
  );
}