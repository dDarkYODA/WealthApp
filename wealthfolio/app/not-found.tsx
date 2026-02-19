import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-black space-y-4">
      <h2 className="text-4xl font-black">404 - Page Not Found</h2>
      <p className="text-xl">The page you requested does not exist.</p>
      <Link href="/" className="bg-black text-white px-4 py-2 font-bold hover:bg-gray-800">
        Return Home
      </Link>
    </div>
  )
}
