"use client"

import React, { ReactNode } from "react"
import { Box } from "@mui/material"

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
}

export default function OverlayBox({
  children,
  left,
  right,
  top,
  bottom,
  width = 320,
  zIndex = 0,
  bgcolor = "rgba(255,255,255,0.95)",
  sx,
  ariaLabel,
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
      {children}
    </Box>
  )
}
