
import Link from 'next/link'

export default function Nav() {
  return (
    <nav className="mb-8 border-b pb-4 flex gap-6 text-sm text-gray-700">
      <Link href="/">Home</Link>
      <Link href="/experience">Experience</Link>
      <Link href="/education">Education</Link>
      <Link href="/projects">Projects</Link>
      <Link href="/leadership">Leadership & Volunteer</Link>
      <Link href="/publications">Publications</Link>
    </nav>
  )
}
