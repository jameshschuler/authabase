import React, { useState } from 'react'
import { z } from 'zod'
import { Button } from '../ui/Button'
import { EmailInput } from '../inputs/EmailInput'
import { useAuth } from '../../provider'
import type { MagicLinkFormProps } from '../../types'

const magicLinkSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export function MagicLinkForm({ onSuccess, onError, redirectTo }: MagicLinkFormProps) {
  const { supabase, enabledMethods } = useAuth()
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState<string | undefined>()
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const resolvedRedirectTo =
    redirectTo ?? (typeof window !== 'undefined' ? window.location.origin : undefined)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setGeneralError(null)
    setSuccessMessage(null)
    setEmailError(undefined)

    if (!enabledMethods.email) {
      setGeneralError('Email authentication is disabled in the current auth configuration')
      return
    }

    if (!supabase) {
      setGeneralError('Supabase client not initialized')
      return
    }

    const parsed = magicLinkSchema.safeParse({ email })
    if (!parsed.success) {
      setEmailError(parsed.error.issues[0]?.message ?? 'Invalid email address')
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: resolvedRedirectTo,
        },
      })

      if (error) throw error

      setSuccessMessage('Magic link sent. Check your email to continue.')
      onSuccess?.(email)
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to send magic link')
      setGeneralError(err.message)
      onError?.(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {generalError && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{generalError}</div>
      )}

      {successMessage && (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">{successMessage}</div>
      )}

      <EmailInput
        id="magic-link-email"
        name="email"
        label="Email"
        placeholder="Enter your email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        error={emailError}
        disabled={isLoading}
        required
      />

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Sending magic link...' : 'Send Magic Link'}
      </Button>
    </form>
  )
}

MagicLinkForm.displayName = 'MagicLinkForm'
