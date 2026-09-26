"use client"

import React from "react"
import { Box, ButtonBase, Stack, Typography } from "@mui/material"
import type { SxProps, Theme } from "@mui/material"
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined"

type ListCardProps = {
  title: React.ReactNode
  // optional element pinned to the top-right corner; the title leaves `cornerWidth` px for it
  corner?: React.ReactNode
  cornerWidth?: number
  children?: React.ReactNode
  onClick?: () => void
  cardRef?: (el: HTMLElement | null) => void
  sx?: SxProps<Theme>
}

// Card shell shared by the bus stop and places lists: bold title, then whatever the list adds below
export function ListCard({ title, corner, cornerWidth = 32, children, onClick, cardRef, sx }: ListCardProps) {
  return (
    // A div (not a <button>) so cards can contain their own buttons
    <ButtonBase
      component="div"
      ref={cardRef}
      onClick={onClick}
      sx={[
        {
          display: 'block',
          width: '100%',
          textAlign: 'left',
          position: 'relative',
          p: 2,
          // gap above the card when it's scrolled to the top of the panel
          scrollMarginTop: '16px',
          borderRadius: 3,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          transition: 'box-shadow 150ms, border-color 150ms, transform 150ms',
          '&:hover': {
            borderColor: 'primary.light',
            boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
            transform: 'translateY(-1px)',
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: 17, lineHeight: 1.3, pr: corner ? `${cornerWidth + 8}px` : 1 }}>
        {title}
      </Typography>
      {corner && <Box sx={{ position: 'absolute', top: 12, right: 12 }}>{corner}</Box>}
      {children}
    </ButtonBase>
  )
}

// Light-blue "lat, lon" line with a pin icon. coords are [lon, lat].
export function CoordsLine({ coords }: { coords: [number, number] }) {
  const [lon, lat] = coords
  return (
    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mt: 0.5, color: '#42a5f5' }}>
      <PlaceOutlinedIcon sx={{ fontSize: 16 }} />
      <Typography variant="body2" sx={{ fontVariantNumeric: 'tabular-nums' }}>
        {lat.toFixed(5)}, {lon.toFixed(5)}
      </Typography>
    </Stack>
  )
}
