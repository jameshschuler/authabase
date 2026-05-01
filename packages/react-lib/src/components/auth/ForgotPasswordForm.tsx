import React, { useState } from 'react'
import { z } from 'zod'
import { Button } from '../ui/Button'
import { EmailInput } from '../inputs/EmailInput'
import { useAuth } from '../../provider'
import type { ForgotPasswordFormProps } from '../../types'

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

const DEFAULT_COPY = {
  emailLabel: 'Email',
  emailPlaceholder: 'Enter your email',
  submitButton: 'Send Reset Link',
  loadingButton: 'Sending reset link...',
  successMessage: 'Reset link sent. Check your email to continue.',
}

export function ForgotPasswordForm({
  onSuccess,
  onError,
  redirectTo,
  onSubmitStart,
  onSubmitComplete,
  onValidationError,
  mapError,
  copy: copyProp,
}: ForgotPasswordFormProps) {
  const { supabase, enabledMethods } = useAuth()
  const copy = { ...DEFAULT_COPY, ...copyProp }
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

    const parsed = forgotPasswordSchema.safeParse({ email })
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? 'Invalid email address'
      setEmailError(msg)
      onValidationError?.({ email: msg })
      return
    }

    onSubmitStart?.()
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: resolvedRedirectTo,
      })

      if (error) throw error

      setSuccessMessage(copy.successMessage)
      onSuccess?.(email)
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to send reset link')
      const message = mapError ? mapError(err) : err.message
      setGeneralError(message)
      onError?.(err)
    } finally {
      setIsLoading(false)
      onSubmitComplete?.()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {generalError && (
        <div
          role="alert"
          aria-live="polite"
          className="rounded-md bg-destructive/10 p-3 text-sm text-destructive"
        >
          {generalError}
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-md bg-green-50 p-3 text-sm text-green-800"
        >
          {successMessage}
        </div>
      )}

      <EmailInput
        id="forgot-password-email"
        name="email"
        label={copy.emailLabel}
        placeholder={copy.emailPlaceholder}
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        error={emailError}
        disabled={isLoading}
        required
      />

      <Button type="submit" className="w-full" disabled={isLoading} aria-busy={isLoading}>
        {isLoading ? copy.loadingButton : copy.submitButton}
      </Button>
    </form>
  )
}

ForgotPasswordForm.displayName = 'ForgotPasswordForm'
