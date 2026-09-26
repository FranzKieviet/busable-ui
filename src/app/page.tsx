"use client";

import { useRouter } from "next/navigation";
import { Box, Typography } from "@mui/material";
import Image from "next/image";
// Hand-drawn bus: white lines on a transparent background
import busDrawing from "@/assests/busable-bus.png";
import CityMapBackground from "@/components/CityMapBackground";
import Navbar from "@/components/Navbar";
import RollingText from "@/components/RollingText";
import AddressSearch from "@/components/AddressSearch";
import type { AddressSuggestion } from "@/components/AddressSearch";

// Dark blue palette for the welcome page
const NAVY = "#0a1f44";
const ACCENT = "#5cc8ff";

// Same font as the Navbar and .blueText
const FONT = '"Univers", sans-serif';

// Tilt of the bus drawing in degrees; negative lifts the front (right side) up
const BUS_ANGLE = -5;

// The map page; a picked address is passed along as ?q=&lat=&lon=
const EXPLORE_HREF = "/explore";

// Tagline: rolls up through these in order, then repeats
const TAGLINES = ["Where can you go?", "Find your stop", "Pick a bus", "Discover places"];

export default function Welcome() {
  const router = useRouter();

  // Open the map with the picked address; the map page loads its nearby stops
  function explore({ label, lat, lon }: AddressSuggestion) {
    const params = new URLSearchParams({ q: label, lat: String(lat), lon: String(lon) });
    router.push(`${EXPLORE_HREF}?${params.toString()}`);
  }

  return (
    <Box
      component="main"
      sx={{
        minHeight: "100vh",
        color: "#fff",
        fontFamily: FONT,
        // MUI Typography sets the theme font on itself, so override it for everything on this page
        "& .MuiTypography-root, & .MuiInputBase-root": { fontFamily: FONT },
        bgcolor: NAVY,
        display: "flex",
        alignItems: "center",
        px: { xs: 2, md: 6 },
        py: { xs: 6, md: 8 },
        // contain the map background
        position: "relative",
        overflow: "hidden",
      }}
    >
      <CityMapBackground />

      {/* Same navbar as the map page: logo in the top-left corner */}
      <Navbar />

      {/* Bus on the left; name, tagline and search on the right */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 1200,
          mx: "auto",
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1.1fr" },
          alignItems: "center",
          gap: { xs: 5, md: 8 },
        }}
      >
        {/* Left: hand-drawn bus, tilted nose-up as if climbing */}
        <Box sx={{ maxWidth: { xs: 320, md: "none" }, mx: "auto", width: "100%", px: { xs: 1, md: 4 }, py: { xs: 2, md: 4 } }}>
          <Image
            src={busDrawing}
            alt="Hand-drawn Busable bus with a cat in the front window"
            priority
            style={{ width: "100%", height: "auto", display: "block", transform: `rotate(${BUS_ANGLE}deg)` }}
          />
        </Box>

        {/* Right: name + rolling tagline centered over the search bar */}
        <Box sx={{ width: "100%", maxWidth: 560, mx: "auto", textAlign: "center" }}>
          <Typography
            component="h1"
            sx={{ fontWeight: 600, fontSize: { xs: 56, sm: 72, md: 96 }, lineHeight: 1, letterSpacing: "-0.03em" }}
          >
            Busable
          </Typography>
          <RollingText phrases={TAGLINES} sx={{ mt: 1.5, fontSize: { xs: 22, md: 30 }, fontWeight: 500, color: ACCENT }} />

          {/* Real address search: picking a result opens the map at that address */}
          <Box sx={{ mt: 4, textAlign: "left" }}>
            <AddressSearch
              variant="hero"
              placeholder="Search an address to start exploring"
              onPick={explore}
              onSubmitEmpty={() => router.push(EXPLORE_HREF)}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
