import React, { useRef, useState } from 'react'
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

const DEFAULT_COPY = {
  emailLabel: 'Email',
  emailPlaceholder: 'Enter your email',
  passwordLabel: 'Password',
  confirmPasswordLabel: 'Confirm Password',
  confirmPasswordPlaceholder: 'Confirm your password',
  submitButton: 'Sign Up',
  loadingButton: 'Creating account...',
  successMessage: 'Sign up successful! Check your email for verification.',
  orContinueWith: 'Or continue with',
  loginPrompt: 'Already have an account?',
  loginLink: 'Sign in',
  noMethodsMessage: 'No sign-up methods are enabled in the current auth configuration.',
  passwordMismatch: 'Passwords do not match',
}

export function SignupForm({
  onSuccess,
  onError,
  showLoginLink,
  onLoginClick,
  loginHref = '#login',
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
}: SignupFormProps) {
  const { supabase, enabledMethods } = useAuth()
  const copy = { ...DEFAULT_COPY, ...copyProp }
  const minLength = Math.max(1, minPasswordLength)
  const signupSchema = z
    .object({
      email: z.string().email('Invalid email address'),
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

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<Partial<SignupFormData>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
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

    if (errors[name as keyof SignupFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }

    if (errors.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: undefined }))
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

    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: copy.passwordMismatch })
      return
    }

    const result = signupSchema.safeParse(formData)
    if (!result.success) {
      const formErrors: Partial<SignupFormData> = {}
      result.error.issues.forEach((issue) => {
        formErrors[issue.path[0] as keyof SignupFormData] = issue.message as any
      })
      setErrors(formErrors)
      onValidationError?.(formErrors as Record<string, string>)
      if (formErrors.email) emailRef.current?.focus()
      else if (formErrors.password) passwordRef.current?.focus()
      return
    }

    onSubmitStart?.()
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      })

      if (error) throw error

      setSuccessMessage(copy.successMessage)
      const user: AuthUser = {
        id: data.user?.id || '',
        email: data.user?.email,
        user_metadata: data.user?.user_metadata,
      }
      onSuccess?.(user)
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to sign up')
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

      {enabledMethods.email && (
        <>
          <EmailInput
            ref={emailRef}
            id="email"
            name="email"
            placeholder={copy.emailPlaceholder}
            value={formData.email}
            onChange={handleInputChange}
            error={errors.email}
            label={copy.emailLabel}
            disabled={isLoading}
            required
          />

          <PasswordInput
            ref={passwordRef}
            id="password"
            name="password"
            placeholder={`At least ${minLength} characters`}
            value={formData.password}
            onChange={handleInputChange}
            error={errors.password}
            label={copy.passwordLabel}
            disabled={isLoading}
            showStrengthIndicator
            required
          />

          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            placeholder={copy.confirmPasswordPlaceholder}
            value={formData.confirmPassword}
            onChange={handleInputChange}
            error={errors.confirmPassword}
            label={copy.confirmPasswordLabel}
            disabled={isLoading}
            required
          />

          <Button type="submit" className="w-full" disabled={isLoading} aria-busy={isLoading}>
            {isLoading ? copy.loadingButton : copy.submitButton}
          </Button>
        </>
      )}

      {(enabledMethods.google || enabledMethods.github) && (
        <>
          {enabledMethods.email && (
            <div className="relative" aria-hidden="true">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-card px-2 text-muted-foreground">{copy.orContinueWith}</span>
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
        <p className="text-sm text-muted-foreground">{copy.noMethodsMessage}</p>
      )}

      {showLoginLink && (
        <p className="text-center text-sm text-muted-foreground">
          {copy.loginPrompt}{' '}
          {onLoginClick ? (
            <button
              type="button"
              onClick={onLoginClick}
              className="font-medium text-primary hover:underline"
            >
              {copy.loginLink}
            </button>
          ) : (
            <a href={loginHref} className="font-medium text-primary hover:underline">
              {copy.loginLink}
            </a>
          )}
        </p>
      )}
    </form>
  )
}

SignupForm.displayName = 'SignupForm'
