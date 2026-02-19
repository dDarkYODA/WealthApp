export const dynamic = 'force-dynamic'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
// @ts-ignore
import { Auth } from '@supabase/auth-ui-react'
// @ts-ignore
import { ThemeSupa } from '@supabase/auth-ui-shared'

export default async function LoginPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (session) {
    redirect('/')
  }

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <Card className="w-full max-w-md border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-black">Welcome Back</CardTitle>
          <CardDescription className="font-bold text-black/60">
            Sign in to access your wealth dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
             {/* Using a simple custom button for now as Auth UI component might need client side wrapping */}
             <form action={async () => {
                 'use server'
                 const supabase = await createClient()
                 const { data, error } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
                    },
                 })
                 if (data.url) {
                    redirect(data.url)
                 }
             }}>
                <Button className="w-full font-bold text-lg h-12 border-2 border-transparent bg-black text-white hover:bg-gray-800" type="submit">
                    Sign in with Google
                </Button>
             </form>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
