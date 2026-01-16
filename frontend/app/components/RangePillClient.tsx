
"use client"

import { useRef, useState } from "react"
import HoverPortal from "./HoverPortal"

// Keep your types consistent with page.tsx
type TimelineType = "experience" | "education" | "leadership" | "project" | "publication"

type TimelineItemClient = {
  id: string
  type: TimelineType
  title: string
  subtitle?: string
  whenLabel?: string
  detail?: string
  href?: string
  logoUrl?: string
  topPct: number
  heightPct: number
  leftPct: number    // NEW
  widthPct: number   // NEW
}

const TYPE_STYLES: Record<TimelineType, { bg: string; border: string; text: string }> = {
  education:   { bg: "bg-sky-100",     border: "border-sky-300",     text: "text-sky-800"     },
  experience:  { bg: "bg-amber-100",   border: "border-amber-300",   text: "text-amber-800"   },
  leadership:  { bg: "bg-violet-100",  border: "border-violet-300",  text: "text-violet-800"  },
  project:     { bg: "bg-emerald-100", border: "border-emerald-300", text: "text-emerald-800" },
  publication: { bg: "bg-rose-100",    border: "border-rose-300",    text: "text-rose-800"    },
}

function labelForType(t: TimelineType) {
  switch (t) {
    case "experience":  return "Experience"
    case "education":   return "Education"
    case "leadership":  return "Leadership"
    case "project":     return "Project"
    case "publication": return "Publications"
    default:            return t
  }
}

export default function RangePillClient({ item }: { item: TimelineItemClient }) {
  const anchorRef = useRef<HTMLAnchorElement | HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const s = TYPE_STYLES[item.type]

  const PillInner = (
    <div className="p-2">
      {/*div className={`text-[0.8rem] font-semibold ${s.text}`}>{labelForType(item.type)}</div REMOVED: no need to show type label inside pill -->*/}
    </div>
  )

  // If href exists, render an <a> so the entire pill is clickable
  const PillTag = item.href ? "a" : "div"

  return (
    <>
      <PillTag
        ref={anchorRef as any}
        href={item.href}   
        className={`absolute group rounded-md border ${s.border} ${s.bg} shadow-sm`}
        style={{
          top: `${item.topPct}%`,
          height: `${item.heightPct}%`,
          left: `${item.leftPct}%`,      // NEW
          width: `${item.widthPct}%`,    // NEW
          cursor: item.href ? "pointer" : "default",
        }}
        tabIndex={0}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        {PillInner}
      </PillTag>

      {/* Hover card via portal — never clipped by scroll container */}
      <HoverPortal anchorRef={anchorRef} open={open} width={260} offset={12}>
        <div className="flex items-start gap-2">
          {/* logo in hover header for edu/exp/lead if available */}
          {item.logoUrl ? (
            <img
              src={item.logoUrl}
              alt=""
              className="h-5 w-5 rounded-sm border border-gray-200 object-cover"
            />
          ) : null}
          <div className="min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate">
              {item.href ? (
                <a href={item.href} className="underline decoration-dotted hover:decoration-solid">
                  {item.title}
                </a>
              ) : (
                item.title
              )}
            </div>
            {item.subtitle ? <div className="text-xs text-gray-700">{item.subtitle}</div> : null}
            {item.whenLabel ? <div className="mt-0.5 text-[0.7rem] text-gray-500">{item.whenLabel}</div> : null}
          </div>
        </div>

        {item.detail ? <div className="mt-2">{item.detail}</div> : null}
      </HoverPortal>
    </>
  )
}
``
