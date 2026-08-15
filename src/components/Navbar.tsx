"use client";

import { AppBar, Toolbar, Typography, Box, Button} from "@mui/material";
import Image from "next/image";

const navButtonStyle = {
  color: "gray",
  fontWeight: "bold",
  fontFamily: "Univers, sans-serif",
  transition: "all 0.3s ease",
  "&:hover": {
    color: "#0099D8",
    backgroundColor: "transparent",
  },

  "&::after": {
    content: '""',
    position: "absolute",
    width: "0%",
    height: "2px",
    bottom: 0,
    left: "50%",
    backgroundColor: "#0099D8",
    transition: "all 0.3s ease",
    transform: "translateX(-50%)",
  },

  "&:hover::after": {
    width: "70%",
  },
};

export default function Navbar() {
  return (
    <AppBar
      position="fixed"
      color="transparent"
      elevation={0}
      sx={{ top: 0, zIndex: (theme) => theme.zIndex.appBar, backdropFilter: "blur(4px)" }}
    >
      <Toolbar>
        {/* LEFT SIDE (logo) */}
        <Image
            src="/franz-logo-bart-theme.png"
            alt="Logo"
            width={40}
            height={40}
            style={{ borderRadius: 8 }}
        />

        {/* RIGHT SIDE (navigation links) */}
        <Box sx={{ flexGrow: 1 }} /> {/* This is a spacer that pushes the links to the right */}
            <Button sx={navButtonStyle} component="a" href="#top">
              Home
            </Button>
            <Button sx={navButtonStyle} component="a" href="#about">
              About
            </Button>
            <Button sx={navButtonStyle} component="a" href="#projects">
              Projects
            </Button>
            <Button sx={navButtonStyle} component="a" href="#resume">
              Resume
            </Button>

      </Toolbar>
    </AppBar>
  );
}