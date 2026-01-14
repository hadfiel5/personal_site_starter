
"use client"

import { useEffect } from "react"

/**
 * Sets a CSS variable --timelineHeight once on mount to the remaining viewport
 * space after the intro (#intro). Does not update on scroll/resize.
 */
export default function TimelineHeightClient({
  minHeightPx = 520,
  extraOffsetPx = 8, // small spacing under intro
}: {
  minHeightPx?: number
  extraOffsetPx?: number
}) {
  useEffect(() => {
    const intro = document.getElementById("intro")
    const introRect = intro?.getBoundingClientRect()
    const introBottom = introRect ? introRect.bottom : 0
    
    const th = document.getElementById("timeline-headers")
    const thRect = th?.getBoundingClientRect()
    const thBottom = thRect ? thRect.bottom : 0
    const vh = window.innerHeight
    const h = Math.max(minHeightPx, vh - thBottom - extraOffsetPx)

    document.documentElement.style.setProperty("--timelineHeight", `${h}px`)

    // One-shot: no listeners retained
  }, [minHeightPx, extraOffsetPx])

  return null
}
