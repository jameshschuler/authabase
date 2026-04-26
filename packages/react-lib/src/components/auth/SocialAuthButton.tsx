import { useState } from 'react'
import { Button } from '../ui/Button'
import { useAuth } from '../../provider'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGoogle, faGithub } from '@fortawesome/free-brands-svg-icons'
import type { SocialAuthButtonProps } from '../../types'

export function SocialAuthButton({
  provider,
  onError,
  className,
}: SocialAuthButtonProps) {
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

  const icon = provider === 'google' ? faGoogle : faGithub
  const label = `Sign in with ${provider.charAt(0).toUpperCase() + provider.slice(1)}`
  const providerStyles =
    'border !border-slate-600 bg-white text-slate-900 hover:bg-slate-50 hover:!border-slate-800'

  return (
    <Button
      variant="outline"
      className={`w-full justify-start gap-2 ${providerStyles} ${className ?? ''}`}
      onClick={handleSocialSignIn}
      disabled={isLoading}
      type="button"
    >
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-sm">
        <FontAwesomeIcon icon={icon} className="text-sm" />
      </span>
      {isLoading ? 'Signing in...' : label}
    </Button>
  )
}

SocialAuthButton.displayName = 'SocialAuthButton'
