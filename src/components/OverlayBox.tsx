"use client"

import React, { ReactNode } from "react"
import { Box, IconButton } from "@mui/material"
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
  // optional callbacks for the three header buttons (rendered top-right)
  onBusStopsClick?: () => void
  onLocateClick?: () => void
  onCloseClick?: () => void
}

export default function OverlayBox({
  children,
  left,
  right,
  top,
  bottom,
  width = 320,
  zIndex = 1000,
  bgcolor = "rgba(255,255,255,0.95)",
  sx,
  ariaLabel,
  onBusStopsClick,
  onLocateClick,
  onCloseClick,
}: Props) {
  const positionStyle: any = { position: "fixed", zIndex }
  if (left !== undefined) positionStyle.left = left
  if (right !== undefined) positionStyle.right = right
  if (top !== undefined) positionStyle.top = top
  if (bottom !== undefined) positionStyle.bottom = bottom

  return (
    <Box
      sx={{
        ...positionStyle,
        width,
        bgcolor,
        boxShadow: 3,
        borderRadius: 2,
        p: 2,
        overflow: "auto",
        ...sx,
      }}
      aria-label={ariaLabel}
    >
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mb: 1 }}>
        <IconButton size="small" aria-label="bus stops" onClick={onBusStopsClick}>
          <SignpostIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" aria-label="locate" onClick={onLocateClick}>
          <MyLocationIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" aria-label="close" onClick={onCloseClick}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
      {children}
    </Box>
  )
}
