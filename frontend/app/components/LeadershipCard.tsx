
type TargetRef = {
  type: 'organization' | 'institution'
  id: number
  short_name?: string
  long_name?: string
  logo?: string | null
  website?: string
}

type Highlight = { id: number; text: string }
type Skill = { id: number; name: string }

export type Leadership = {
  id: number
  category: 'leadership' | 'volunteer'
  title: string
  start_date: string
  end_date: string | null
  location: string
  summary?: string
  url?: string
  target_ref?: TargetRef | null
  highlights: Highlight[]
  skills: Skill[]
  photos?: { id: number; image: string; alt_text?: string }[]
}

const label = (t?: TargetRef|null) => t ? (t.short_name || t.long_name || '') : ''

export default function LeadershipCard({ item }: { item: Leadership }) {
  const end = item.end_date ? new Date(item.end_date) : null
  const start = new Date(item.start_date)
  const range = `${start.toLocaleString('en-US', { month: 'short', year: 'numeric' })} - ${end ? end.toLocaleString('en-US', { month: 'short', year: 'numeric' }) : 'Present'}`

  return (
    <article className="card">
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {item.target_ref?.logo && (
            <img src={item.target_ref.logo!} alt={label(item.target_ref)} className="h-8 w-8 rounded object-cover" />
          )}
          <div>
            <h3 className="text-lg font-semibold">{item.title}</h3>
            <p className="text-xs text-gray-500 uppercase tracking-wide">{item.category}</p>
            <p className="text-sm text-gray-600">{label(item.target_ref)} · {item.location}</p>
          </div>
        </div>
        <span className="text-xs text-gray-500">{range}</span>
      </header>

      {item.summary && <p className="mt-2 text-sm">{item.summary}</p>}
      {!!item.highlights?.length && (
        <ul className="mt-2 list-disc pl-5 text-sm">
          {item.highlights.map(h => <li key={h.id}>{h.text}</li>)}
        </ul>
      )}
      {!!item.skills?.length && (
        <div className="mt-3 flex flex-wrap gap-2">
          {item.skills.map(s => (
            <span key={s.id} className="text-xs bg-gray-100 px-2 py-1 rounded">{s.name}</span>
          ))}
        </div>
      )}
      {!!item.photos?.length && (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {item.photos.map(p => (
            <img key={p.id} src={p.image} alt={p.alt_text || 'photo'} className="h-24 w-full rounded object-cover" />
          ))}
        </div>
      )}
      {item.url && <a className="text-xs text-blue-600 mt-2 inline-block" href={item.url} target="_blank">Learn more</a>}
    </article>
  )
}
