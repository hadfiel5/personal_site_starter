
"use client"

import { useEffect, useState, useRef } from "react"
import { createPortal } from "react-dom"

type HoverPortalProps = {
  /** Ref to the pill element we’re hovering */
  anchorRef: React.RefObject<HTMLElement>
  /** Controls visibility */
  open: boolean
  /** Card width in px (used for clamping) */
  width?: number
  /** Preferred offset from the anchor in px */
  offset?: number
  /** Card contents */
  children: React.ReactNode
}

/**
 * Renders a fixed-position hover card near the given anchor (pill),
 * outside any scroll/overflow clipping. Positions + clamps to viewport.
 */
export default function HoverPortal({
  anchorRef,
  open,
  width = 260,
  offset = 12,
  children,
}: HoverPortalProps) {
  const [mounted, setMounted] = useState(false)
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 })
  const rafId = useRef<number | null>(null)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // Compute a good fixed position near the anchor
  useEffect(() => {
    if (!open || !anchorRef.current) return

    const compute = () => {
      const rect = anchorRef.current!.getBoundingClientRect()
      const vw = window.innerWidth
      const vh = window.innerHeight

      // Preferred: right side of pill
      let left = rect.right + offset
      let top = rect.top

      // If too close to right edge, place on the left
      if (left + width + 8 > vw) {
        left = Math.max(8, rect.left - offset - width)
      }

      // Clamp vertically
      const cardHeight = 180 // rough default; adjusts visually
      if (top + cardHeight + 8 > vh) {
        top = Math.max(8, vh - cardHeight - 8)
      }
      if (top < 8) top = 8

      setPos({ top, left })
    }

    compute()
    // Track scrolling/resizing for smooth positioning
    const onScroll = () => {
      if (rafId.current) cancelAnimationFrame(rafId.current)
      rafId.current = requestAnimationFrame(() => compute())
    }
    const onResize = onScroll

    window.addEventListener("scroll", onScroll, true)
    window.addEventListener("resize", onResize)
    return () => {
      window.removeEventListener("scroll", onScroll, true)
      window.removeEventListener("resize", onResize)
      if (rafId.current) cancelAnimationFrame(rafId.current)
    }
  }, [open, anchorRef, offset, width])

  if (!mounted || !open) return null

  return createPortal(
    <div
      style={{
        position: "fixed",
        top: pos.top,
        left: pos.left,
        width,
        zIndex: 50, // above timeline
      }}
      className="text-xs text-gray-700 bg-white border border-gray-200 rounded-md shadow-lg p-2"
      role="dialog"
      aria-modal="false"
    >
      {children}
    </div>,
    document.body
  )
}
