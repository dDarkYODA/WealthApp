'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'

export default function LoginPage() {
  const supabase = createClient()
  const [origin, setOrigin] = useState('')

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
      <div className="w-full max-w-md p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
        <h1 className="text-3xl font-black mb-6 text-center border-b-4 border-black pb-2">Login to WealthFolio</h1>
        <div className="auth-container font-medium text-black">
            <Auth
                supabaseClient={supabase}
                appearance={{
                    theme: ThemeSupa,
                    variables: {
                        default: {
                            colors: {
                                brand: 'black',
                                brandAccent: '#333',
                                inputText: 'black',
                                inputPlaceholder: '#666',
                                inputBorder: 'black',
                                inputLabelText: 'black',
                            },
                            radii: {
                                borderRadiusButton: '0px',
                                inputBorderRadius: '0px',
                            },
                            borderWidths: {
                                buttonBorderWidth: '2px',
                                inputBorderWidth: '2px',
                            },
                            fonts: {
                                bodyFontFamily: 'inherit',
                                buttonFontFamily: 'inherit',
                            }
                        }
                    },
                    style: {
                        button: {
                            border: '2px solid black',
                            color: 'white',
                            fontWeight: 'bold'
                        },
                        input: {
                            color: 'black',
                            fontWeight: '500'
                        },
                        label: {
                            fontWeight: 'bold',
                            color: 'black'
                        }
                    }
                }}
                providers={['google']}
                redirectTo={`${origin}/auth/callback`}
                onlyThirdPartyProviders={false}
            />
        </div>
      </div>
    </div>
  )
}
