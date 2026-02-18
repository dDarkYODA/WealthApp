export default function AuthCodeError() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-black">
      <h1 className="text-3xl font-black mb-4">Auth Error</h1>
      <p className="font-medium">There was an error authenticating your request.</p>
    </div>
  )
}
