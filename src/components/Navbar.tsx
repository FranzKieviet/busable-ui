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

type Props = {
  // optional name shown next to the logo (the welcome page has its own big heading, so it leaves this off)
  title?: string
}

export default function Navbar({ title }: Props) {
  return (
    <AppBar
      position="fixed"
      color="transparent"
      elevation={0}
      sx={{ top: 0, zIndex: (theme) => theme.zIndex.appBar }}
    >
      <Toolbar>
        {/* LEFT SIDE (logo) on a white circle; the logo's own white background blends into it */}
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            bgcolor: "#fff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Image
              src="/franz-logo-bart-theme.png"
              alt="Logo"
              width={34}
              height={34}
          />
        </Box>
        {title && (
          <Typography
            component="span"
            sx={{ ml: 1.5, color: "#fff", fontFamily: "Univers, sans-serif", fontWeight: 600, fontSize: 24, letterSpacing: "-0.02em", textShadow: "0 1px 4px rgba(0,0,0,0.35)" }}
          >
            {title}
          </Typography>
        )}

      </Toolbar>
    </AppBar>
  );
}