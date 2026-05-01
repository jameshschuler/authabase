import React, { useRef, useState } from 'react'
import { z } from 'zod'
import { Button } from '../ui/Button'
import { PasswordInput } from '../inputs/PasswordInput'
import { useAuth } from '../../provider'
import type { AuthUser, ResetPasswordFormProps } from '../../types'

type ResetPasswordFormData = {
  password: string
  confirmPassword: string
}

const DEFAULT_COPY = {
  passwordLabel: 'New Password',
  confirmPasswordLabel: 'Confirm Password',
  confirmPasswordPlaceholder: 'Confirm your new password',
  submitButton: 'Update Password',
  loadingButton: 'Updating password...',
  successMessage: 'Password updated successfully. You can now sign in with your new password.',
  passwordMismatch: 'Passwords do not match',
}

export function ResetPasswordForm({
  onSuccess,
  onError,
  minPasswordLength = 8,
  requireUppercase = true,
  requireLowercase = true,
  requireNumber = true,
  requireSpecialChar = false,
  onSubmitStart,
  onSubmitComplete,
  onValidationError,
  mapError,
  copy: copyProp,
}: ResetPasswordFormProps) {
  const { supabase } = useAuth()
  const copy = { ...DEFAULT_COPY, ...copyProp }
  const minLength = Math.max(1, minPasswordLength)
  const resetPasswordSchema = z
    .object({
      password: (() => {
        let s = z.string().min(minLength, `Password must be at least ${minLength} characters`)
        if (requireLowercase) s = s.regex(/[a-z]/, 'Password must contain lowercase letters')
        if (requireUppercase) s = s.regex(/[A-Z]/, 'Password must contain uppercase letters')
        if (requireNumber) s = s.regex(/\d/, 'Password must contain numbers')
        if (requireSpecialChar)
          s = s.regex(/[^a-zA-Z0-9]/, 'Password must contain a special character')
        return s
      })(),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: copy.passwordMismatch,
      path: ['confirmPassword'],
    })

  const [formData, setFormData] = useState<ResetPasswordFormData>({
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<Partial<ResetPasswordFormData>>({})
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const passwordRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    const nextFormData = { ...formData, [name]: value }
    setFormData(nextFormData)

    if (nextFormData.confirmPassword && nextFormData.password !== nextFormData.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
        confirmPassword: copy.passwordMismatch,
      }))
      return
    }

    if (errors[name as keyof ResetPasswordFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }

    if (errors.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: undefined }))
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setGeneralError(null)
    setSuccessMessage(null)
    setErrors({})

    if (!supabase) {
      setGeneralError('Supabase client not initialized')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: copy.passwordMismatch })
      return
    }

    const parsed = resetPasswordSchema.safeParse(formData)
    if (!parsed.success) {
      const formErrors: Partial<ResetPasswordFormData> = {}
      parsed.error.issues.forEach((issue) => {
        formErrors[issue.path[0] as keyof ResetPasswordFormData] = issue.message as any
      })
      setErrors(formErrors)
      onValidationError?.(formErrors as Record<string, string>)
      if (formErrors.password) passwordRef.current?.focus()
      return
    }

    onSubmitStart?.()
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: formData.password,
      })

      if (error) throw error

      setSuccessMessage(copy.successMessage)

      const user: AuthUser = {
        id: data.user?.id ?? '',
        email: data.user?.email,
        phone: data.user?.phone,
        user_metadata: data.user?.user_metadata,
      }
      onSuccess?.(user)
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to reset password')
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

      <PasswordInput
        ref={passwordRef}
        id="reset-password"
        name="password"
        label={copy.passwordLabel}
        placeholder={`At least ${minLength} characters`}
        value={formData.password}
        onChange={handleInputChange}
        error={errors.password}
        disabled={isLoading}
        showStrengthIndicator
        required
      />

      <PasswordInput
        id="reset-password-confirm"
        name="confirmPassword"
        label={copy.confirmPasswordLabel}
        placeholder={copy.confirmPasswordPlaceholder}
        value={formData.confirmPassword}
        onChange={handleInputChange}
        error={errors.confirmPassword}
        disabled={isLoading}
        required
      />

      <Button type="submit" className="w-full" disabled={isLoading} aria-busy={isLoading}>
        {isLoading ? copy.loadingButton : copy.submitButton}
      </Button>
    </form>
  )
}

ResetPasswordForm.displayName = 'ResetPasswordForm'
