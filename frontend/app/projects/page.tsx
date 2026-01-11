
import Nav from '../components/Nav'

async function fetchProjects() {
  const url = process.env.NEXT_PUBLIC_API_URL + '/projects/'
  const res = await fetch(url, { next: { revalidate: 60 } })
  if (!res.ok) throw new Error('Failed to fetch projects')
  return res.json()
}

export default async function ProjectsPage() {
  const items = await fetchProjects()
  return (
    <div>
      <Nav />
      <h1 className="text-2xl font-semibold mb-4">Projects</h1>
      <ul className="space-y-3">
        {items.map((p: any) => (
          <li key={p.id} className="card">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{p.name}</h3>
                <p className="text-sm text-gray-600">{p.role}</p>
              </div>
              {p.url && <a className="text-xs text-blue-600" href={p.url} target="_blank">Link</a>}
            </div>
            {p.summary && <p className="mt-2 text-sm">{p.summary}</p>}
          </li>
        ))}
      </ul>
    </div>
  )
}
