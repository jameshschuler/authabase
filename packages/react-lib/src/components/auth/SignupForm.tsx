import React, { useState } from 'react'
import { Button } from '../ui/Button'
import { EmailInput } from '../inputs/EmailInput'
import { PasswordInput } from '../inputs/PasswordInput'
import { SocialAuthButton } from './SocialAuthButton'
import { useAuth } from '../../provider'
import { z } from 'zod'
import type { SignupFormProps, AuthUser } from '../../types'

type SignupFormData = {
  email: string
  password: string
  confirmPassword: string
}

export function SignupForm({
  onSuccess,
  onError,
  showLoginLink,
  minPasswordLength = 8,
}: SignupFormProps) {
  const { supabase, enabledMethods } = useAuth()
  const minLength = Math.max(1, minPasswordLength)
  const signupSchema = z
    .object({
      email: z.string().email('Invalid email address'),
      password: z
        .string()
        .min(minLength, `Password must be at least ${minLength} characters`)
        .regex(/[a-z]/, 'Password must contain lowercase letters')
        .regex(/[A-Z]/, 'Password must contain uppercase letters')
        .regex(/\d/, 'Password must contain numbers'),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    })

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<Partial<SignupFormData>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof SignupFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGeneralError(null)
    setSuccessMessage(null)
    setErrors({})

    if (!supabase) {
      setGeneralError('Supabase client not initialized')
      return
    }

    // Validate form
    const result = signupSchema.safeParse(formData)
    if (!result.success) {
      const formErrors: Partial<SignupFormData> = {}
      result.error.issues.forEach((issue) => {
        formErrors[issue.path[0] as keyof SignupFormData] = issue.message as any
      })
      setErrors(formErrors)
      return
    }

    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      })

      if (error) throw error

      setSuccessMessage('Sign up successful! Check your email for verification.')
      const user: AuthUser = {
        id: data.user?.id || '',
        email: data.user?.email,
        user_metadata: data.user?.user_metadata,
      }
      onSuccess?.(user)
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to sign up')
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

      {enabledMethods.email && (
        <>
          <EmailInput
            id="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleInputChange}
            error={errors.email}
            label="Email"
            disabled={isLoading}
            required
          />

          <PasswordInput
            id="password"
            name="password"
            placeholder={`At least ${minLength} characters`}
            value={formData.password}
            onChange={handleInputChange}
            error={errors.password}
            label="Password"
            disabled={isLoading}
            showStrengthIndicator
            required
          />

          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            error={errors.confirmPassword}
            label="Confirm Password"
            disabled={isLoading}
            required
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Sign Up'}
          </Button>
        </>
      )}

      {(enabledMethods.google || enabledMethods.github) && (
        <>
          {enabledMethods.email && (
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {enabledMethods.google && (
              <SocialAuthButton provider="google" onError={onError} className="w-full" />
            )}
            {enabledMethods.github && (
              <SocialAuthButton provider="github" onError={onError} className="w-full" />
            )}
          </div>
        </>
      )}

      {!enabledMethods.email && !enabledMethods.google && !enabledMethods.github && (
        <p className="text-sm text-muted-foreground">
          No sign-up methods are enabled in the current auth configuration.
        </p>
      )}

      {showLoginLink && (
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <a href="#login" className="font-medium text-primary hover:underline">
            Sign in
          </a>
        </p>
      )}
    </form>
  )
}

SignupForm.displayName = 'SignupForm'
