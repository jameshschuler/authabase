import React, { useState } from 'react'
import { Button } from '../ui/Button'
import { EmailInput } from '../inputs/EmailInput'
import { PasswordInput } from '../inputs/PasswordInput'
import { SocialAuthButton } from './SocialAuthButton'
import { useAuth } from '../../provider'
import { z } from 'zod'
import type { LoginFormProps, AuthUser } from '../../types'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm({ onSuccess, onError, showSignupLink }: LoginFormProps) {
  const { supabase, enabledMethods } = useAuth()
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState<Partial<LoginFormData>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [generalError, setGeneralError] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof LoginFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault()
    setGeneralError(null)
    setErrors({})

    if (!supabase) {
      setGeneralError('Supabase client not initialized')
      return
    }

    // Validate form
    const result = loginSchema.safeParse(formData)
    if (!result.success) {
      const formErrors: Partial<LoginFormData> = {}
      result.error.issues.forEach((issue) => {
        formErrors[issue.path[0] as keyof LoginFormData] = issue.message as any
      })
      setErrors(formErrors)
      return
    }

    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (error) throw error

      const user: AuthUser = {
        id: data.user.id,
        email: data.user.email,
        user_metadata: data.user.user_metadata,
      }
      onSuccess?.(user)
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to sign in')
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
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleInputChange}
            error={errors.password}
            label="Password"
            disabled={isLoading}
            required
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
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
          No sign-in methods are enabled in the current auth configuration.
        </p>
      )}

      {showSignupLink && (
        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <a href="#signup" className="font-medium text-primary hover:underline">
            Sign up
          </a>
        </p>
      )}
    </form>
  )
}

LoginForm.displayName = 'LoginForm'
