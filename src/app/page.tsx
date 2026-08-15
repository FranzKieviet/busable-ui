"use client";

import { Container, Box } from "@mui/material";
import Navbar from "@/components/Navbar";
import Map from "@/components/Map";
import LeftOverlay from "@/components/LeftOverlay";
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

      {/* Left overlay to display Bus Stops */}
        <LeftOverlay />
      </Box>
    </BusStopsProvider>
  );
}