import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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

export type Experience = {
  id: number
  target_ref?: TargetRef | null
  role: string
  start_date: string
  end_date: string | null
  location: string
  summary?: string
  highlights: Highlight[]
  skills: Skill[]
  photos?: { id: number; image: string; alt_text?: string }[]
}

export default function ExperienceCard({ exp }: { exp: Experience }) {
  const end = exp.end_date ? new Date(exp.end_date) : null
  const start = new Date(exp.start_date)
  const range = `${start.toLocaleString('en-US', { month: 'short', year: 'numeric' })} - ${end ? end.toLocaleString('en-US', { month: 'short', year: 'numeric' }) : 'Present'}`
  const orgName = exp.target_ref?.short_name || exp.target_ref?.long_name

  return (
    <article className="card">
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {exp.target_ref?.logo && (
            <img
              src={exp.target_ref?.logo}
              alt={orgName}
              className="h-8 w-8 rounded object-cover"
            />
          )}
          <div>
            <h3 className="text-lg font-semibold">{exp.role}</h3>
            <p className="text-sm text-gray-600">{orgName} · {exp.location}</p>
          </div>
        </div>
        <span className="text-xs text-gray-500">{range}</span>
      </header>
      {!!exp.summary && (
        <div className="prose max-w-none mt-2 prose-ul:list-disc prose-li:ml-5">
          <ReactMarkdown remarkPlugins={[remarkGfm]} >
            {exp.summary}
          </ReactMarkdown>
        </div>
      )}
      {!!exp.highlights?.length && (
        <ul className="mt-2 list-disc pl-5 text-sm">
          {exp.highlights.map(h => <li key={h.id}>{h.text}</li>)}
        </ul>
      )}

      {!!exp.skills?.length && (
        <div className="mt-3 flex flex-wrap gap-2">
          {exp.skills.map(s => (
            <span key={s.id} className="text-xs bg-gray-100 px-2 py-1 rounded">{s.name}</span>
          ))}
        </div>
      )}

      {!!exp.photos?.length && (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {exp.photos.map(p => (
            <img key={p.id} src={p.image} alt={p.alt_text || 'photo'} className="h-24 w-full rounded object-cover" />
          ))}
        </div>
      )}
    </article>
  )
}
