"use client"

import React, { useContext, useEffect, useState } from "react"
import { Box, IconButton, Popper, Typography } from "@mui/material"
import type { PopperPlacementType } from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import { PanelCollapsedContext } from "./OverlayBox"
import { ACCENT, NAVY } from "@/theme"

type Props = {
  // unique id; closing a tip is remembered under this id so it stays closed on later visits
  id: string
  // element the arrow points at
  anchorEl: HTMLElement | null
  // side of the anchor the tip sits on (the arrow points back at the anchor)
  placement?: PopperPlacementType
  // extra condition for showing (e.g. only once results have loaded)
  show?: boolean
  children: React.ReactNode
}

const storageKey = (id: string) => `busable:help-tip:${id}`
const ARROW = 12
// how long a panel takes to slide back in; tips wait for it so they measure the final position
const PANEL_SLIDE_MS = 320

/**
 * Small dismissible callout with an arrow pointing at `anchorEl`. It renders outside the panels
 * (so their scrolling doesn't clip it), follows the anchor when the panel scrolls, hides while the
 * anchor is scrolled out of view or its panel is collapsed, and stays closed once dismissed.
 */
export default function HelpTip({ id, anchorEl, placement = "right", show = true, children }: Props) {
  const collapsed = useContext(PanelCollapsedContext)
  // start hidden and read the saved choice after mount (localStorage isn't available during SSR)
  const [dismissed, setDismissed] = useState(true)
  const [arrowEl, setArrowEl] = useState<HTMLElement | null>(null)
  // false while the panel is collapsed or still sliding back in
  const [panelSettled, setPanelSettled] = useState(!collapsed)

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(storageKey(id)) === "1")
    } catch {
      setDismissed(false)
    }
  }, [id])

  useEffect(() => {
    if (collapsed) {
      setPanelSettled(false)
      return
    }
    const t = window.setTimeout(() => setPanelSettled(true), PANEL_SLIDE_MS)
    return () => window.clearTimeout(t)
  }, [collapsed])

  function dismiss() {
    setDismissed(true)
    try {
      localStorage.setItem(storageKey(id), "1")
    } catch {
      // storage unavailable (private mode etc.): the tip still closes for this visit
    }
  }

  const open = show && !dismissed && panelSettled && !!anchorEl

  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      placement={placement}
      modifiers={[
        { name: "offset", options: { offset: [0, ARROW] } },
        { name: "arrow", enabled: true, options: { element: arrowEl, padding: 10 } },
        { name: "preventOverflow", options: { padding: 8 } },
        // sets data-popper-reference-hidden when the anchor is scrolled out of its panel
        { name: "hide", enabled: true },
      ]}
      sx={{
        // above the side panels (z-index 1000) but below dialogs
        zIndex: 1200,
        maxWidth: 260,
        "&[data-popper-reference-hidden]": { visibility: "hidden", pointerEvents: "none" },
        // point the arrow back at the anchor from whichever side the tip ended up on
        '&[data-popper-placement^="right"] .help-tip-arrow': { left: -ARROW / 2 },
        '&[data-popper-placement^="left"] .help-tip-arrow': { right: -ARROW / 2 },
        '&[data-popper-placement^="bottom"] .help-tip-arrow': { top: -ARROW / 2 },
        '&[data-popper-placement^="top"] .help-tip-arrow': { bottom: -ARROW / 2 },
      }}
    >
      <Box
        role="note"
        sx={{
          position: "relative",
          display: "flex",
          alignItems: "flex-start",
          gap: 0.5,
          pl: 1.5,
          pr: 0.5,
          py: 1,
          borderRadius: 2,
          bgcolor: ACCENT,
          color: NAVY,
          boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
        }}
      >
        <Box
          ref={setArrowEl}
          className="help-tip-arrow"
          sx={{ position: "absolute", width: ARROW, height: ARROW, bgcolor: ACCENT, transform: "rotate(45deg)" }}
        />
        <Typography variant="body2" sx={{ position: "relative", fontWeight: 600, lineHeight: 1.35, pt: 0.25 }}>
          {children}
        </Typography>
        <IconButton
          size="small"
          aria-label="Close tip"
          onClick={dismiss}
          sx={{ position: "relative", color: NAVY, p: 0.25, mt: -0.25, "&:hover": { bgcolor: "rgba(10,31,68,0.1)" } }}
        >
          <CloseIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>
    </Popper>
  )
}
