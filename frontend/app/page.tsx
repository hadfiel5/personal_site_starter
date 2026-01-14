
// app/page.tsx
// Rich, range-based vertical timeline (columns per type)
// Only the timeline panel is narrow + scrollable.
// Left sidebar shows aligned year ticks + faint dividers.
//
// CHANGED: do NOT constrain <main> width
// NEW: wrap timeline in a narrow panel with fixed width & overflow-y

import Nav from './components/Nav'
import RangePillClient from "./components/RangePillClient"
import TimelineHeightClient from "./components/TimelineHeightClient"
``


/** -------------------------------------
 * Config
 * ------------------------------------- */
const TIMELINE_START_YEAR = 2013
const TIMELINE_END = new Date()

// NEW: narrow timeline panel width (≈ one-third typical desktop)
const TIMELINE_PANEL_WIDTH_PX = 550 // tweak to 420 / 384 if you want narrower

// Column order & labels
const COLUMNS: { type: TimelineType; label: string }[] = [
  { type: 'education',   label: 'Education' },
  { type: 'experience',  label: 'Experience' },
  { type: 'leadership',  label: 'Leadership' },
  { type: 'project',     label: 'Projects' },
  { type: 'publication', label: 'Publications' },
]

// Tailwind-friendly palette per type
const TYPE_STYLES: Record<
  TimelineType,
  { bg: string; border: string; text: string; ring: string; pill: string }
> = {
  education:   { bg: 'bg-sky-100',      border: 'border-sky-300',      text: 'text-sky-800',      ring: 'ring-sky-200',      pill: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200' },
  experience:  { bg: 'bg-amber-100',    border: 'border-amber-300',    text: 'text-amber-800',    ring: 'ring-amber-200',    pill: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' },
  leadership:  { bg: 'bg-violet-100',   border: 'border-violet-300',   text: 'text-violet-800',   ring: 'ring-violet-200',   pill: 'bg-violet-50 text-violet-700 ring-1 ring-violet-200' },
  project:     { bg: 'bg-emerald-100',  border: 'border-emerald-300',  text: 'text-emerald-800',  ring: 'ring-emerald-200',  pill: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' },
  publication: { bg: 'bg-rose-100',     border: 'border-rose-300',     text: 'text-rose-800',     ring: 'ring-rose-200',     pill: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200' },
}

/** -------------------------------------
 * Types & helpers
 * ------------------------------------- */
type TimelineType = 'experience' | 'education' | 'leadership' | 'project' | 'publication'
type AnyRecord = Record<string, any>

type TimelineItem = {
  id: string
  type: TimelineType
  title: string
  subtitle?: string
  start?: Date
  end?: Date
  whenLabel?: string
  detail?: string
  href?: string
  logoUrl?: string
  topPct?: number
  heightPct?: number
  leftPct?: number    // NEW
  widthPct?: number   // NEW
}

// SSR API base
const API = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || ''

async function safeJSON<T = any>(res: Response): Promise<T> {
  if (!res.ok) {
    const txt = await res.text().catch(() => '')
    throw new Error(`Fetch failed: ${res.status} ${res.statusText} – ${txt}`)
  }
  return res.json()
}

function ymd(dateStr?: string | null): Date | undefined {
  if (!dateStr) return
  const d = new Date(String(dateStr))
  return isNaN(d.getTime()) ? undefined : d
}
const startOfYear = (y: number) => new Date(Date.UTC(y, 0, 1))

function orgName(o?: AnyRecord) { return o ? (o.short_name || o.long_name || '') : '' }
function instName(i?: AnyRecord) { return i ? (i.short_name || i.long_name || '') : '' }

function rangeLabel(start?: Date, end?: Date) {
  const fmt = (d?: Date) => (d ? d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '')
  if (!start && !end) return ''
  if (start && !end) return `${fmt(start)} – Present`
  if (!start && end) return fmt(end)
  return `${fmt(start)} – ${fmt(end)}`
}
function yearOrDateLabel(year?: number | null, dateStr?: string | null) {
  const d = ymd(dateStr || undefined)
  if (d) return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  return year ? String(year) : ''
}

/** -------------------------------------
 * Fetch & map
 * ------------------------------------- */
async function fetchAll() {
  const endpoints = {
    experiences: `${API}/experience/`,
    education:   `${API}/education/`,
    projects:    `${API}/projects/`,
    leadership:  `${API}/leadership/`,
    publications:`${API}/publications/`,
  }
  const nextOpts = { next: { revalidate: 3600 } }

  const [experiences, education, projects, leadership, publications] = await Promise.all([
    fetch(endpoints.experiences, nextOpts).then(safeJSON).catch(() => []),
    fetch(endpoints.education,   nextOpts).then(safeJSON).catch(() => []),
    fetch(endpoints.projects,    nextOpts).then(safeJSON).catch(() => []),
    fetch(endpoints.leadership,  nextOpts).then(safeJSON).catch(() => []),
    fetch(endpoints.publications,nextOpts).then(safeJSON).catch(() => []),
  ])
  return { experiences, education, projects, leadership, publications }
}

function mapToTimeline(payloads: Record<string, AnyRecord[]>): TimelineItem[] {
  const { experiences = [], education = [], projects = [], leadership = [], publications = [] } = payloads
  const items: TimelineItem[] = []

  // Experience
  for (const e of experiences) {
    const start = ymd(e.start_date)
    const end   = ymd(e.end_date) || TIMELINE_END
    const place =
      orgName(e.organization) ||
      (e.target?.long_name || e.target?.short_name) ||
      e.target_ref?.short_name || e.target_ref?.long_name || ''
    const logo =
      e.organization?.logo ||
      e.target?.logo ||
      e.target_ref?.logo || null
    items.push({
      id: `exp_${e.id}`,
      type: 'experience',
      title: e.role || 'Experience',
      subtitle: [place, e.location].filter(Boolean).join(' · '),
      start, end,
      whenLabel: rangeLabel(start, end),
      detail: '',
      logoUrl: logo || undefined,
    })
  }

  // Education
  for (const ed of education) {
    const start = ymd(ed.start_date)
    const end   = ymd(ed.end_date) || TIMELINE_END
    const title = [ed.degree_name, ed.major].filter(Boolean).join(' — ')
    const inst  = ed.institution
    items.push({
      id: `edu_${ed.id}`,
      type: 'education',
      title: title || 'Education',
      subtitle: instName(inst),
      start, end,
      whenLabel: rangeLabel(start, end),
      detail:'',
      logoUrl: inst?.logo || undefined,
    })
  }

  // Leadership/Volunteer
  for (const l of leadership) {
    const start = ymd(l.start_date)
    const end   = ymd(l.end_date) || TIMELINE_END
    const tgt   = l.target_ref
    const place = tgt?.short_name || tgt?.long_name || ''
    items.push({
      id: `lead_${l.id}`,
      type: 'leadership',
      title: l.title || (l.category === 'volunteer' ? 'Volunteer' : 'Leadership'),
      subtitle: [place, l.location].filter(Boolean).join(' · '),
      start, end,
      whenLabel: rangeLabel(start, end),
      detail: '',
      href: l.url || undefined,
      logoUrl: tgt?.logo || undefined,
    })
  }

  // Projects
  for (const p of projects) {
    const start = ymd(p.start_date)
    const end   = ymd(p.end_date) || TIMELINE_END
    items.push({
      id: `proj_${p.id}`,
      type: 'project',
      title: p.name || 'Project',
      subtitle: p.role || '',
      start, end,
      whenLabel: rangeLabel(start, end),
      detail: '',
      href: p.url || undefined,
    })
  }

  // Publications (point-in-time)
  for (const pub of publications) {
    const whenLbl = yearOrDateLabel(pub.year, pub.published_on)
    const when = ymd(pub.published_on) || (pub.year ? ymd(`${pub.year}-01-01`) : TIMELINE_END)
    items.push({
      id: `pub_${pub.id}`,
      type: 'publication',
      title: pub.title || 'Publication',
      subtitle: pub.journal_or_venue || '',
      start: when, end: when,
      whenLabel: whenLbl,
      detail: '',
      href: pub.url || (pub.doi ? `https://doi.org/${pub.doi}` : undefined),
    })
  }

  // Filter by year cutoff
  const minDate = startOfYear(TIMELINE_START_YEAR)
  return items.filter((t) => {
    const ref = t.start || t.end
    return !ref || ref >= minDate
  })
}

/** -------------------------------------
 * Range-to-percentage math
 * ------------------------------------- */
function clampDate(d?: Date): Date | undefined {
  if (!d) return undefined
  if (d < startOfYear(TIMELINE_START_YEAR)) return startOfYear(TIMELINE_START_YEAR)
  if (d > TIMELINE_END) return TIMELINE_END
  return d
}
function pctBetween(start?: Date, end?: Date) {
  const min = startOfYear(TIMELINE_START_YEAR).getTime()
  const max = TIMELINE_END.getTime()
  const span = Math.max(1, max - min)
  const s = clampDate(start)?.getTime() ?? min
  const e = clampDate(end)?.getTime()   ?? s
  const topPct = 100 - ((s - min) / span) * 100
  const heightPct = Math.max(1, ((e - s) / span) * 100)
  return { topPct, heightPct }
}

function computePercents(items: TimelineItem[]) {
  const startOfYear = (y: number) => new Date(Date.UTC(y, 0, 1))
  const clampDate = (d?: Date): Date | undefined => {
    if (!d) return undefined
    if (d < startOfYear(TIMELINE_START_YEAR)) return startOfYear(TIMELINE_START_YEAR)
    if (d > TIMELINE_END) return TIMELINE_END
    return d
  }
  const min = startOfYear(TIMELINE_START_YEAR).getTime()
  const max = TIMELINE_END.getTime()
  const span = Math.max(1, max - min)

  return items.map((it) => {
    const s = clampDate(it.start)?.getTime() ?? min
    const e = clampDate(it.end)?.getTime()   ?? s
    const topPct = 100 - ((e - min) / span) * 100
    const heightPct = Math.max(1, ((e - s) / span) * 100)
    return { ...it, topPct, heightPct }
  })
}


// NEW: interval helpers (server-side)
function toMs(d?: Date) {
  return d ? d.getTime() : undefined;
}
function intersects(aStart?: number, aEnd?: number, bStart?: number, bEnd?: number) {
  if (aStart === undefined || aEnd === undefined || bStart === undefined || bEnd === undefined) return false;
  // Intervals [aStart, aEnd] and [bStart, bEnd] overlap if they intersect in time
  return aStart < bEnd && bStart < aEnd;
}

// NEW: assign horizontal lanes per type, latest-ending left-most
function applyHorizontalStacking(itemsWithLayout: (TimelineItem & { topPct: number; heightPct: number })[]) {
  // We’ll produce leftPct/widthPct per item
  const result = itemsWithLayout.map(i => ({ ...i, leftPct: 0, widthPct: 100 }));

  // Group items by type (column)
  const byType = groupByColumn(result);

  const GUTTER_PCT = 2; // small horizontal spacing between lanes, in percent

  (Object.keys(byType) as TimelineType[]).forEach(type => {
    const list = byType[type];

    // Sort by end descending so latest-ending items are placed first (furthest left)
    list.sort((a, b) => {
      const aEnd = toMs(a.end) ?? 0;
      const bEnd = toMs(b.end) ?? 0;
      return bEnd - aEnd;
    });

    // Greedy lane assignment: each lane stores the 'end' of its last item
    type Lane = { lastEnd: number, lastStart: number };
    const lanes: Lane[] = [];

    // First pass: assign laneIndex for each item
    const laneIndex: Record<string, number> = {};

    list.forEach(item => {
      const s = toMs(item.start) ?? 0;
      const e = toMs(item.end) ?? s;

      let placed = false;
      for (let i = 0; i < lanes.length; i++) {
        if (s >= lanes[i].lastEnd || e <= lanes[i].lastStart) {
          // fits in this lane after the lane's last item
          laneIndex[item.id] = i;
          lanes[i].lastEnd = e;
          lanes[i].lastStart = s;
          placed = true;
          break;
        }
      }
      if (!placed) {
        // open a new lane
        laneIndex[item.id] = lanes.length;
        lanes.push({ lastEnd: e, lastStart: s });
      }
    });

    // Second pass: for each item, compute how many items overlap its time span (concurrency)
    list.forEach(item => {
      const s = toMs(item.start);
      const e = toMs(item.end);
      let overlapCount = 1;

      if (s !== undefined && e !== undefined) {
        overlapCount = list.reduce((count, other) => {
          if (other.id === item.id) return count;
          const os = toMs(other.start);
          const oe = toMs(other.end);
          return intersects(s, e, os, oe) ? count + 1 : count;
        }, 1);
      }

      // Width and left based on overlap count and lane index
      const lanesForThisItem = overlapCount;
      const laneWidth = (100 - (lanesForThisItem - 1) * GUTTER_PCT) / lanesForThisItem;
      const idx = laneIndex[item.id];
      const left = idx * (laneWidth + GUTTER_PCT);

      item.widthPct = Math.max(5, laneWidth); // keep a minimum width
      item.leftPct = left;
    });
  });

  return result;
}



/** -------------------------------------
 * Column utilities
 * ------------------------------------- */
function groupByColumn(items: TimelineItem[]) {
  const byType: Record<TimelineType, TimelineItem[]> = {
    education: [], experience: [], leadership: [], project: [], publication: [],
  }
  for (const it of items) byType[it.type].push(it)
  return byType
}
function labelForType(t: TimelineType) {
  return COLUMNS.find(c => c.type === t)?.label ?? t
}

/** -------------------------------------
 * Year ticks (left sidebar + dividers)
 * ------------------------------------- */
function computeYearTicks() {
  const ticks: { year: number; topPct: number }[] = []
  const endYear = new Date().getUTCFullYear()
  for (let y = TIMELINE_START_YEAR; y <= endYear; y++) {
    const { topPct } = pctBetween(startOfYear(y), startOfYear(y))
    ticks.push({ year: y, topPct })
  }
  return ticks
}

function YearSidebar() {
  const ticks = computeYearTicks()
  return (
    <div className="relative h-full">
      {ticks.map(t => (
        <div
          key={t.year}
          className="absolute -right-1 translate-y-[-40%] text-xs text-gray-500"
          style={{ top: `${t.topPct}%` }}
          aria-hidden
        >
          {t.year}
        </div>
      ))}
    </div>
  )
}

function YearDividers({ offsetPx }: { offsetPx: number }) {
  const ticks = computeYearTicks()
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden>
      {ticks.map(t => (
        <div
          key={`line_${t.year}`}
          className="absolute border-t border-gray-200"
          style={{ top: `${t.topPct}%`, left: `${offsetPx}px`, right: 0, zIndex: -1 }}
        />
      ))}
    </div>
  )
}

/** -------------------------------------
 * UI components
 * ------------------------------------- */
function Legend() {
  return (
    <ul className="flex flex-wrap gap-2 mt-6 text-xs justify-center">
      {COLUMNS.map(c => (
        <li key={c.type} className={`px-2 py-0.5 rounded ${TYPE_STYLES[c.type].pill}`}>
          {c.label}
        </li>
      ))}
    </ul>
  )
}

function RangePill({ item }: { item: TimelineItem }) {
  const { topPct, heightPct } = pctBetween(item.start, item.end)
  const s = TYPE_STYLES[item.type]
  const bgImg = item.logoUrl ? `url(${item.logoUrl})` : undefined

  return (
    <div
      className={`absolute left-0 right-0 group rounded-md border ${s.border} ${s.bg} shadow-sm`}
      style={{
        top: `${topPct}%`,
        height: `${heightPct}%`,
        cursor: 'pointer',
      }}
      tabIndex={0}
      onClick={() => window.location.href = s.href}
    >
      <div className="p-2">
        <div className={`text-[0.8rem] font-semibold ${s.text}`}>{labelForType(item.type)}</div>
      </div>

      {item.detail ? (
        <div className="absolute z-10 hidden group-hover:block group-focus-within:block">
          <div className="mt-1 ml-2 w-64 text-xs text-gray-700 bg-white border border-gray-200 rounded-md shadow-lg p-2">
            <div className="mt-0.5 text-sm font-medium text-gray-900 truncate">
              {item.href ? (
                <a href={item.href} className="underline decoration-dotted hover:decoration-solid">{item.title}</a>
              ) : (
                item.title
              )}
            </div>
            {item.subtitle ? <div className="text-xs text-gray-700">{item.subtitle}</div> : null}
            {item.whenLabel ? <div className="mt-0.5 text-[0.7rem] text-gray-500">{item.whenLabel}</div> : null}
            {item.detail}
          </div>
        </div>
      ) : null}
    </div>
  )
}


function TimelineGrid({ items }: { items: TimelineItem[] }) {
  const grouped = groupByColumn(items)
  const SIDEBAR_W = 44

  return (
    <div className="mt-6">
      {/* Column headers (narrow) */}
      <div
        id="timeline-headers"
        className="grid gap-3"
        style={{
          gridTemplateColumns: `${SIDEBAR_W}px repeat(${COLUMNS.length}, minmax(0, 1fr))`,
        }}
      >
        <div />
        {COLUMNS.map(col => (
          <div key={col.type}>
            <h3 className="text-sm font-semibold text-gray-800">{col.label}</h3>
          </div>
        ))}
      </div>

      {/* Scrollable rail (unchanged) */}
      <div
        className="mt-2 overflow-y-auto rounded-md shadow-sm"
        style={{ height: "var(--timelineHeight, 520px)" }} // auto-fit after intro
      >
        <div
          className="relative grid gap-3"
          style={{
            gridTemplateColumns: `${SIDEBAR_W}px repeat(${COLUMNS.length}, minmax(0, 1fr))`,
            minHeight: 1000,
          }}
        >
          <div className="relative">
            <YearSidebar />
          </div>

          {COLUMNS.map(col => (
            <div key={col.type} className="relative">
              <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-gray-200 rounded" aria-hidden />
              <div className="relative h-full">
                {(grouped[col.type] ?? []).map(it => (
                  // CHANGED: use client version so hover card can escape overflow
                  <RangePillClient
                    key={it.id}
                    item={{
                      id: it.id,
                      type: it.type,
                      title: it.title,
                      subtitle: it.subtitle,
                      whenLabel: it.whenLabel,
                      detail: it.detail,
                      href: it.href,
                      logoUrl: it.logoUrl,
                      topPct: it.topPct!,         // already set by computePercents(...)
                      heightPct: it.heightPct!,   // already set by computePercents(...)
                      // NEW:
                      leftPct: it.leftPct!,       // set by applyHorizontalStacking(...)
                      widthPct: it.widthPct!,     // set by applyHorizontalStacking(...)
                    }}
                  />
                ))}
              </div>
            </div>
          ))}

          <YearDividers offsetPx={SIDEBAR_W} />
        </div>
      </div>
    </div>
  )
}


/** -------------------------------------
 * NEW: TimelinePanel wrapper
 * ------------------------------------- */
function TimelinePanel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="mt-6 mx-auto"
      style={{ width: TIMELINE_PANEL_WIDTH_PX }} // ONLY the timeline panel is narrow
    >
      {children}
    </div>
  )
}

/** -------------------------------------
 * Page (SSR)
 * ------------------------------------- */
export default async function HomePage() {
  const { experiences, education, projects, leadership, publications } = await fetchAll()
  const items = mapToTimeline({ experiences, education, projects, leadership, publications })
  const itemsWithLayout = computePercents(items)
  const itemsWithLayoutAndLanes = applyHorizontalStacking(itemsWithLayout)

  return (
    <main className="mx-auto max-w-5xl">{/* CHANGED: keep a normal, full-width page container */}
      <Nav />

      <header id="intro" className="mt-4 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Brandon Hadfield</h1>
        <p className="text-m text-gray-600">
          <i>Welcome to my website. Here you can see what I've been up to. </i>
        </p>
        <p className="text-sm text-gray-500 mt-3">
          Hover on items, click through the tabs, or download my resume.
        </p>
        <p className="text-sm text-gray-500">
          Passion project, made with love in Django + Next.js
        </p>
        <Legend />
        <div className="mt-3">
          <a
            className="inline-flex items-center gap-2 text-sm text-blue-700 underline decoration-dotted hover:decoration-solid"
            href={process.env.NEXT_PUBLIC_API_URL?.replace('/api','') + '/export/resume.pdf'}
          >
            Download Résumé (PDF)
          </a>
        </div>
      </header>

      {/* CHANGED: wrap ONLY the timeline in a narrow panel; rest of page stays full width */}
      {/* NEW: adjust timeline height to viewport via client component */}
      <TimelineHeightClient minHeightPx={200} extraOffsetPx={8} /> 
      <TimelinePanel>
        <TimelineGrid items={itemsWithLayoutAndLanes} />
      </TimelinePanel>
    </main>
  )
}
