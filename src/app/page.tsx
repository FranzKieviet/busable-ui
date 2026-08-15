"use client";

import { Container, Box } from "@mui/material";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";

export default function Home() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #ffffff, #0099D8)",
      }}
    >
      <Navbar />

      <Container maxWidth="md" sx={{ mt: 10, textAlign: "center" }}>
        <Hero />
      </Container>

      <About />
    </Box>
  );
}