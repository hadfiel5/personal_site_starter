
import Nav from './components/Nav'

export default function HomePage() {
  return (
    <div>
      <Nav />
      <header className="mb-8">
        <h1 className="text-3xl font-semibold">Brandon Hadfield</h1>
        <p className="text-gray-600">Graduate Researcher · Boston, MA</p>
      </header>
      <section className="prose max-w-none">
        <p className="text-sm">Minimalist academic profile. Explore experience, education, and projects via the navigation.</p>
      </section>
      <a
        className="inline-block mt-4 px-3 py-2 rounded bg-indigo-600 text-white text-sm"
        href={process.env.NEXT_PUBLIC_API_URL?.replace('/api','') + '/export/resume.pdf'}
      >
        Download Résumé (PDF)
      </a>
    </div>
  )
}

