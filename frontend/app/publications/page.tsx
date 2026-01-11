
import Nav from '../components/Nav'
import PublicationCard from '../components/PublicationCard'

async function fetchPublications() {
  const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/publications/', { next: { revalidate: 60 } })
  if (!res.ok) throw new Error('Failed to fetch publications')
  return res.json()
}

export default async function PublicationsPage() {
  const items = await fetchPublications()
  return (
    <div>
      <Nav />
      <h1 className="text-2xl font-semibold mb-4">Publications</h1>
      <div className="space-y-4">
        {items.map((p: any) => <PublicationCard key={p.id} item={p} />)}
      </div>
    </div>
  )
}
