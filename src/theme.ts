import { createTheme } from "@mui/material/styles";

// Brand colors shared with the welcome page
export const NAVY = "#0a1f44";
export const ACCENT = "#5cc8ff";

const typography = {
  fontFamily: "var(--font-geist), sans-serif",
};

export const theme = createTheme({
  typography,
});

// Dark navy scheme for the map page (/explore), matching the welcome page.
// Components that use theme colors (cards, dividers, text, inputs, chips) pick this up automatically.
export const exploreTheme = createTheme({
  typography,
  palette: {
    mode: "dark",
    primary: { main: ACCENT },
    background: { default: NAVY, paper: "#28508c" },
    text: { primary: "#ffffff", secondary: "rgba(255,255,255,0.7)" },
    divider: "rgba(255,255,255,0.12)",
  },
});
