import React, { useState } from 'react'
import { z } from 'zod'
import { Button } from '../ui/Button'
import { PasswordInput } from '../inputs/PasswordInput'
import { useAuth } from '../../provider'
import type { AuthUser, ResetPasswordFormProps } from '../../types'

type ResetPasswordFormData = {
  password: string
  confirmPassword: string
}

export function ResetPasswordForm({
  onSuccess,
  onError,
  minPasswordLength = 8,
  passwordMismatchText = 'Passwords do not match',
}: ResetPasswordFormProps) {
  const { supabase } = useAuth()
  const minLength = Math.max(1, minPasswordLength)
  const resetPasswordSchema = z
    .object({
      password: z
        .string()
        .min(minLength, `Password must be at least ${minLength} characters`)
        .regex(/[a-z]/, 'Password must contain lowercase letters')
        .regex(/[A-Z]/, 'Password must contain uppercase letters')
        .regex(/\d/, 'Password must contain numbers'),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: passwordMismatchText,
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

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    const nextFormData = { ...formData, [name]: value }
    setFormData(nextFormData)

    if (nextFormData.confirmPassword && nextFormData.password !== nextFormData.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
        confirmPassword: passwordMismatchText,
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
      setErrors({ confirmPassword: passwordMismatchText })
      return
    }

    const parsed = resetPasswordSchema.safeParse(formData)
    if (!parsed.success) {
      const formErrors: Partial<ResetPasswordFormData> = {}
      parsed.error.issues.forEach((issue) => {
        formErrors[issue.path[0] as keyof ResetPasswordFormData] = issue.message as any
      })
      setErrors(formErrors)
      return
    }

    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: formData.password,
      })

      if (error) throw error

      setSuccessMessage(
        'Password updated successfully. You can now sign in with your new password.'
      )

      const user: AuthUser = {
        id: data.user?.id ?? '',
        email: data.user?.email,
        phone: data.user?.phone,
        user_metadata: data.user?.user_metadata,
      }
      onSuccess?.(user)
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to reset password')
      setGeneralError(err.message)
      onError?.(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {generalError && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {generalError}
        </div>
      )}

      {successMessage && (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">{successMessage}</div>
      )}

      <PasswordInput
        id="reset-password"
        name="password"
        label="New Password"
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
        label="Confirm Password"
        placeholder="Confirm your new password"
        value={formData.confirmPassword}
        onChange={handleInputChange}
        error={errors.confirmPassword}
        disabled={isLoading}
        required
      />

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Updating password...' : 'Update Password'}
      </Button>
    </form>
  )
}

ResetPasswordForm.displayName = 'ResetPasswordForm'
