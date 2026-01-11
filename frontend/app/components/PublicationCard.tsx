
// frontend/app/components/PublicationCard.tsx
type TargetRef = {
  type: 'organization' | 'institution'
  id: number
  short_name?: string
  long_name?: string
  logo?: string | null
  website?: string
}

type Author = {
  id: number
  full_name: string
  affiliation?: string
  order: number
  corresponding?: boolean
  me?: boolean          // <-- already in your serializer
}

type Skill = { id: number; name: string }

export type Publication = {
  id: number
  kind: string
  title: string
  year?: number | null
  published_on?: string | null
  journal_or_venue?: string
  volume?: string
  issue?: string
  pages?: string
  doi?: string
  doi_url?: string | null
  url?: string
  // abstract?: string    // <-- we won’t render this on the card
  target_ref?: TargetRef | null
  authors: Author[]
  skills: Skill[]
  photos?: { id: number; image: string; alt_text?: string }[]
}

const label = (t?: TargetRef|null) => t ? (t.short_name || t.long_name || '') : ''
const kindBadge = (k: string) =>
  k === 'journal'    ? 'bg-indigo-50 text-indigo-700' :
  k === 'conference' ? 'bg-emerald-50 text-emerald-700' :
                       'bg-gray-100 text-gray-700'

export default function PublicationCard({ item }: { item: Publication }) {
  const dateLabel = item.published_on
    ? new Date(item.published_on).toLocaleDateString()
    : (item.year ?? '')

  const venue = [item.journal_or_venue, item.volume, item.issue].filter(Boolean).join(' ')
  const pageInfo = item.pages ? `pp. ${item.pages}` : ''

  return (
    <article className="card">
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {item.target_ref?.logo && (
            <img
              src={item.target_ref.logo!}
              alt={label(item.target_ref)}
              className="h-8 w-8 rounded object-cover mt-0.5"
            />
          )}
          <div>
            <span className={`text-xs px-2 py-0.5 rounded ${kindBadge(item.kind)}`}>{item.kind}</span>
            <h3 className="text-lg font-semibold mt-1">{item.title}</h3>

            {/* Authors: bold 'me', add ✉︎ for corresponding, comma-separated */}
            <p className="text-sm text-gray-600">
              {item.authors.map((a, idx) => (
                <span key={a.id} className={a.me ? 'font-semibold' : undefined}>
                  {a.full_name}{a.corresponding ? '✉︎' : ''}
                  {idx < item.authors.length - 1 ? ', ' : ''}
                </span>
              ))}
            </p>

            {/* Venue line */}
            <p className="text-sm text-gray-600">
              {venue}
              {venue && item.year ? `, ${item.year}` : ''}
              {pageInfo ? `, ${pageInfo}` : ''}
            </p>

            {/* Target label (org or institution) */}
            <p className="text-xs text-gray-500">{label(item.target_ref)}</p>
          </div>
        </div>

        <div className="text-right">
          {item.doi_url && (
            <a className="text-xs text-blue-600 block" href={item.doi_url} target="_blank" rel="noopener noreferrer">
              DOI
            </a>
          )}
          {item.url && (
            <a className="text-xs text-blue-600 block mt-1" href={item.url} target="_blank" rel="noopener noreferrer">
              Link
            </a>
          )}
          <span className="text-xs text-gray-500 block mt-1">{dateLabel || ''}</span>
        </div>
      </header>

      {/* ABSTRACT REMOVED ON CARD */}
      {/* {item.abstract && <p className="mt-2 text-sm">{item.abstract}</p>} */}

      {!!item.photos?.length && (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {item.photos.map(p => (
            <img key={p.id} src={p.image} alt={p.alt_text || 'photo'} className="h-24 w-full rounded object-cover" />
          ))}
        </div>
      )}

      {!!item.skills?.length && (
        <div className="mt-3 flex flex-wrap gap-2">
          {item.skills.map(s => (
            <span key={s.id} className="text-xs bg-gray-100 px-2 py-1 rounded">{s.name}</span>
          ))}
        </div>
      )}
    </article>
  )
}
