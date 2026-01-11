
import ExperienceCard from '../components/ExperienceCard'
import Nav from '../components/Nav'

async function fetchExperience() {
  const url = process.env.NEXT_PUBLIC_API_URL + '/experience/'
  const res = await fetch(url, { next: { revalidate: 60 } })
  if (!res.ok) throw new Error('Failed to fetch experience')
  return res.json()
}

export default async function ExperiencePage() {
  const experiences = await fetchExperience()
  return (
    <div>
      <Nav />
      <h1 className="text-2xl font-semibold mb-4">Experience</h1>
      <div className="space-y-4">
        {experiences.map((exp: any) => (
          <ExperienceCard key={exp.id} exp={exp} />
        ))}
      </div>
    </div>
  )
}
