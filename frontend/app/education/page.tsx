
import Nav from '../components/Nav'

async function fetchEducation() {
  const url = process.env.NEXT_PUBLIC_API_URL + '/education/'
  const res = await fetch(url, { next: { revalidate: 60 } })
  if (!res.ok) throw new Error('Failed to fetch education')
  return res.json()
}

export default async function EducationPage() {
  const items = await fetchEducation()
  return (
    <div>
      <Nav />
      <h1 className="text-2xl font-semibold mb-4">Education</h1>
      <ul className="space-y-3">
        {items.map((e: any) => (  
        <li key={e.id} className="card">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {e.institution?.logo && (
                // You can also use next/image for optimization
                <img
                  src={e.institution.logo}
                  alt={e.institution.short_name || e.institution.long_name}
                  className="h-8 w-8 rounded object-cover"
                />
              )}
              <div>
                <h3 className="text-lg font-semibold">
                  {e.degree_name}{e.major ? ` in ${e.major}` : ''}
                </h3>
                <p className="text-sm text-gray-600">
                  {e.institution?.short_name || e.institution?.long_name}
                </p>
                {e.minor && <p className="text-xs text-gray-500">Minor: {e.minor}</p>}
              </div>
            </div>
            <span className="text-xs text-gray-500">
              {new Date(e.start_date).toLocaleDateString()} — {e.end_date ? new Date(e.end_date).toLocaleDateString() : 'Present'}
            </span>
          </div>

          {!!e.photos?.length && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {e.photos.map((p: any) => (
                <img key={p.id} src={p.image} alt={p.alt_text || 'photo'} className="h-24 w-full rounded object-cover" />
              ))}
            </div>
          )}
        </li>
        ))}
      </ul>
    </div>
  )
}
