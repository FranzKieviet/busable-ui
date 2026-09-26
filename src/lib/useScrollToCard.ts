"use client"

import { useEffect, useRef, useState } from "react"

/**
 * Scrolls a list card to the top of its panel and flashes it when `highlightedId` is set
 * (e.g. after its marker is clicked on the map), then calls `clear()` so it only happens once.
 *
 * Returns `cardRef(id)` to attach to each card, and `showSpacer`: render blank space under the
 * list when it's true so even the last card can scroll up to the top.
 */
export function useScrollToCard(highlightedId: string | null, clear: () => void, loading = false) {
  const cardRefs = useRef<Record<string, HTMLElement | null>>({})
  // Only added once something has been picked on the map, so normal browsing has no empty tail
  const [showSpacer, setShowSpacer] = useState(false)

  useEffect(() => {
    if (!highlightedId || loading) return
    // Render the spacer first; this effect runs again once it's in the DOM
    if (!showSpacer) {
      setShowSpacer(true)
      return
    }
    const el = cardRefs.current[highlightedId]
    clear()
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    const { backgroundColor, borderColor } = getComputedStyle(el)
    const resting = { backgroundColor, borderColor }
    el.animate(
      [resting, { backgroundColor: 'rgba(66,165,245,0.25)', borderColor: '#42a5f5' }, resting],
      { duration: 450, iterations: 3, easing: 'ease-in-out', delay: 250 },
    )
  }, [highlightedId, loading, showSpacer, clear])

  const cardRef = (id: string) => (el: HTMLElement | null) => {
    cardRefs.current[id] = el
  }

  return { cardRef, showSpacer }
}

// Blank space under a list: roughly the panel's visible height minus one card
export const SCROLL_SPACER_HEIGHT = 'calc(100vh - 200px)'
