"use client"

import { useEffect, useState } from "react"
import { Box } from "@mui/material"
import type { SxProps, Theme } from "@mui/material"

type Props = {
  // phrases shown in order, then repeated; up to 4 (one per side of the cube)
  phrases: string[]
  // time each phrase stays up, in ms
  interval?: number
  // length of the roll, in ms
  duration?: number
  // text styles (font size, color, weight…) — the cube is sized from the font size
  sx?: SxProps<Theme>
}

// Line height of each phrase, in em. The cube's faces are this tall and sit half of it from the center.
const LINE = 1.3

/**
 * Cycles through phrases by rolling a 3D cube upward: the current phrase tips up and away over
 * the top while the next one rolls up into view from underneath, like a box rolling over.
 * Each phrase is a face of the cube; the cube keeps turning the same way, so it never rewinds.
 */
export default function RollingText({ phrases, interval = 2500, duration = 700, sx }: Props) {
  const faces = phrases.slice(0, 4)
  // total quarter-turns so far; keeps increasing so every roll goes the same direction
  const [turns, setTurns] = useState(0)

  useEffect(() => {
    if (faces.length < 2) return
    const id = window.setInterval(() => setTurns((t) => t + 1), interval)
    return () => window.clearInterval(id)
  }, [faces.length, interval])

  // With fewer than 4 phrases, skip the unused sides so the cube only shows real phrases
  const step = 4 / faces.length
  const angle = turns * 90 * step

  return (
    <Box sx={[{ position: "relative", height: `${LINE}em`, lineHeight: LINE, perspective: "600px" }, ...(Array.isArray(sx) ? sx : [sx])]}>
      {/* Screen readers get every phrase once instead of a changing line */}
      <Box component="span" sx={visuallyHidden}>
        {faces.join(". ")}
      </Box>

      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          transformStyle: "preserve-3d",
          transform: `translateZ(-${LINE / 2}em) rotateX(${angle}deg)`,
          transition: `transform ${duration}ms cubic-bezier(0.65, 0, 0.35, 1)`,
          "@media (prefers-reduced-motion: reduce)": { transition: "none" },
        }}
      >
        {faces.map((phrase, i) => (
          <Box
            key={phrase}
            component="span"
            sx={{
              position: "absolute",
              inset: 0,
              display: "block",
              whiteSpace: "nowrap",
              backfaceVisibility: "hidden",
              // face i sits on the side that rolls to the front after i turns
              transform: `rotateX(${-90 * step * i}deg) translateZ(${LINE / 2}em)`,
            }}
          >
            {phrase}
          </Box>
        ))}
      </Box>
    </Box>
  )
}

const visuallyHidden = {
  position: "absolute",
  width: 1,
  height: 1,
  p: 0,
  m: "-1px",
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
  border: 0,
} as const
