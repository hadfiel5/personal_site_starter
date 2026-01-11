
import Nav from '../components/Nav'
import LeadershipCard from '../components/LeadershipCard'

async function fetchLeadership() {
  const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/leadership/', { next: { revalidate: 60 } })
  if (!res.ok) throw new Error('Failed to fetch leadership')
  return res.json()
}

export default async function LeadershipPage() {
  const items = await fetchLeadership()
  return (
    <div>
      <Nav />
      <h1 className="text-2xl font-semibold mb-4">Leadership & Volunteer</h1>
      <div className="space-y-4">
        {items.map((i: any) => <LeadershipCard key={i.id} item={i} />)}
      </div>
    </div>
  )
}
