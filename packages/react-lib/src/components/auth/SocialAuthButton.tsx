import { useState } from 'react'
import { Button } from '../ui/Button'
import { useAuth } from '../../provider'
import { Google } from '../icons/Google'
import { GitHub } from '../icons/GitHub'
import type { SocialAuthButtonProps } from '../../types'

export function SocialAuthButton({ provider, onError, className }: SocialAuthButtonProps) {
  const { supabase } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const handleSocialSignIn = async () => {
    if (!supabase) {
      onError?.(new Error('Supabase client not initialized'))
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider as any,
        options: {
          redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
        },
      })

      if (error) throw error
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to sign in with ' + provider)
      onError?.(err)
    } finally {
      setIsLoading(false)
    }
  }

  const Icon = provider === 'google' ? Google : GitHub
  const label = `Sign in with ${provider.charAt(0).toUpperCase() + provider.slice(1)}`

  return (
    <Button
      variant="outline"
      className={`auth-social-button w-full justify-start gap-2 ${className ?? ''}`}
      onClick={handleSocialSignIn}
      disabled={isLoading}
      type="button"
    >
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-sm">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      {isLoading ? 'Signing in...' : label}
    </Button>
  )
}

SocialAuthButton.displayName = 'SocialAuthButton'
