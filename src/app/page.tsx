"use client";

import { Container, Box } from "@mui/material";
import Navbar from "@/components/Navbar";
import Map from "@/components/Map";
import OverlayBox from "@/components/OverlayBox";
import BusStopsList from "@/components/BusStopsList";
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
        <OverlayBox left={100} top={100} bottom={100} width={320} zIndex={0} ariaLabel="left-overlay">
          <BusStopsList />
        </OverlayBox>
      </Box>
    </BusStopsProvider>
  );
}