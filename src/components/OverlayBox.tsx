"use client"

import React, { ReactNode, useState } from "react"
import { Box, ButtonBase, IconButton, Typography } from "@mui/material"
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import SignpostIcon from '@mui/icons-material/Signpost'
import MyLocationIcon from '@mui/icons-material/MyLocation'
import CloseIcon from '@mui/icons-material/Close'

type Props = {
  children?: ReactNode
  left?: number
  right?: number
  top?: number
  bottom?: number
  width?: number | string
  zIndex?: number
  bgcolor?: string
  sx?: any
  ariaLabel?: string
  // panel title shown top-left, with optional secondary text (e.g. a result count) beside it
  title?: ReactNode
  titleAside?: ReactNode
  // optional callbacks for the three header buttons (rendered top-right)
  onBusStopsClick?: () => void
  onLocateClick?: () => void
  onCloseClick?: () => void
  // show a tab on the panel's inner edge that slides it off-screen and back
  collapsible?: boolean
}

const PANEL_BORDER = "1px solid rgba(255,255,255,0.1)"

// Thin, rounded scrollbar that suits the dark panels (standard props for Firefox/new Chrome,
// ::-webkit-scrollbar for Safari and older Chrome)
const scrollbarSx = {
  scrollbarWidth: "thin",
  scrollbarColor: "rgba(255,255,255,0.22) transparent",
  "&::-webkit-scrollbar": { width: 10 },
  "&::-webkit-scrollbar-track": { background: "transparent" },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 8,
    // transparent border + padding-box clip makes the thumb look thinner and inset from the edge
    border: "3px solid transparent",
    backgroundClip: "padding-box",
  },
  "&::-webkit-scrollbar-thumb:hover": { backgroundColor: "rgba(255,255,255,0.35)" },
} as const

export default function OverlayBox({
  children,
  left,
  right,
  top,
  bottom,
  width = 320,
  zIndex = 1000,
  // dark navy panel (the welcome page's NAVY at 95% opacity)
  bgcolor = "rgba(10,31,68,0.95)",
  sx,
  ariaLabel,
  title,
  titleAside,
  onBusStopsClick,
  onLocateClick,
  onCloseClick,
  collapsible = false,
}: Props) {
  const [collapsed, setCollapsed] = useState(false)
  const positionStyle: any = { position: "fixed", zIndex }
  if (left !== undefined) positionStyle.left = left
  if (right !== undefined) positionStyle.right = right
  if (top !== undefined) positionStyle.top = top
  if (bottom !== undefined) positionStyle.bottom = bottom

  // Which screen edge the panel is docked to; it slides off that way and the tab sits on the other side
  const dockLeft = left !== undefined
  const offset = (dockLeft ? left : right) ?? 0
  const hiddenTransform = dockLeft ? `translateX(calc(-100% - ${offset}px))` : `translateX(calc(100% + ${offset}px))`
  const name = typeof title === "string" ? title : "panel"
  const ChevronIcon = dockLeft === collapsed ? ChevronRightIcon : ChevronLeftIcon

  return (
    // Outer frame: position, slide animation and the collapse tab (kept outside the scroll area so it isn't clipped)
    <Box
      sx={{
        ...positionStyle,
        width,
        transform: collapsed ? hiddenTransform : "none",
        transition: "transform 300ms cubic-bezier(0.4, 0, 0.2, 1)",
        "@media (prefers-reduced-motion: reduce)": { transition: "none" },
      }}
      aria-label={ariaLabel}
    >
      {collapsible && (
        <ButtonBase
          onClick={() => setCollapsed((c) => !c)}
          aria-expanded={!collapsed}
          aria-label={`${collapsed ? "Show" : "Hide"} ${name}`}
          title={`${collapsed ? "Show" : "Hide"} ${name}`}
          sx={{
            position: "absolute",
            top: "50%",
            transform: "translateY(-50%)",
            ...(dockLeft ? { left: "100%", borderRadius: "0 10px 10px 0", borderLeft: "none" } : { right: "100%", borderRadius: "10px 0 0 10px", borderRight: "none" }),
            width: 22,
            height: 64,
            bgcolor,
            border: PANEL_BORDER,
            color: "text.secondary",
            boxShadow: 3,
            transition: "color 150ms, background-color 150ms",
            "&:hover": { color: "text.primary", bgcolor: "rgba(20,48,95,0.98)" },
          }}
        >
          <ChevronIcon fontSize="small" />
        </ButtonBase>
      )}

      {/* Scrolling panel body; inert while hidden so its contents can't be tabbed into off-screen */}
      <Box
        inert={collapsed}
        sx={{
          height: "100%",
          bgcolor,
          border: PANEL_BORDER,
          boxShadow: 3,
          borderRadius: 2,
          p: 2,
          overflow: "auto",
          ...scrollbarSx,
          ...sx,
        }}
      >
      {/* Header: title on the left; buttons on the right, each only shown when its callback is provided */}
      {(title || onBusStopsClick || onLocateClick || onCloseClick) && (
        // baseline alignment sits the small count on the title's text line instead of floating mid-height
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1.5 }}>
          {title && (
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {title}
            </Typography>
          )}
          {titleAside && (
            <Typography variant="caption" color="text.secondary">
              {titleAside}
            </Typography>
          )}
          <Box sx={{ flex: 1 }} />
          {onBusStopsClick && (
            <IconButton size="small" aria-label="bus stops" onClick={onBusStopsClick}>
              <SignpostIcon fontSize="small" />
            </IconButton>
          )}
          {onLocateClick && (
            <IconButton size="small" aria-label="locate" onClick={onLocateClick}>
              <MyLocationIcon fontSize="small" />
            </IconButton>
          )}
          {onCloseClick && (
            <IconButton size="small" aria-label="close" onClick={onCloseClick}>
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      )}
      {children}
      </Box>
    </Box>
  )
}
