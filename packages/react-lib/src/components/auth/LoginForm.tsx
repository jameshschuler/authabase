import React, { useRef, useState } from 'react'
import { Button } from '../ui/Button'
import { EmailInput } from '../inputs/EmailInput'
import { PasswordInput } from '../inputs/PasswordInput'
import { SocialAuthButton } from './SocialAuthButton'
import { useAuth } from '../../provider'
import { z } from 'zod'
import type { LoginFormProps, AuthUser } from '../../types'

const loginSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormData = z.infer<typeof loginSchema>

const DEFAULT_COPY = {
  emailLabel: 'Email',
  emailPlaceholder: 'Enter your email',
  passwordLabel: 'Password',
  passwordPlaceholder: 'Enter your password',
  submitButton: 'Sign In',
  loadingButton: 'Signing in...',
  orContinueWith: 'Or continue with',
  signupPrompt: "Don't have an account?",
  signupLink: 'Sign up',
  forgotPasswordLink: 'Forgot password?',
  noMethodsMessage: 'No sign-in methods are enabled in the current auth configuration.',
}

export function LoginForm({
  onSuccess,
  onError,
  showSignupLink,
  onSignupClick,
  signupHref = '#signup',
  onForgotPasswordClick,
  forgotPasswordHref = '#forgot-password',
  showForgotPasswordLink,
  onSubmitStart,
  onSubmitComplete,
  onValidationError,
  mapError,
  copy: copyProp,
}: LoginFormProps) {
  const { supabase, enabledMethods } = useAuth()
  const copy = { ...DEFAULT_COPY, ...copyProp }
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState<Partial<LoginFormData>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [generalError, setGeneralError] = useState<string | null>(null)

  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

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

    const result = loginSchema.safeParse(formData)
    if (!result.success) {
      const formErrors: Partial<LoginFormData> = {}
      result.error.issues.forEach((issue) => {
        formErrors[issue.path[0] as keyof LoginFormData] = issue.message as any
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

          <div className="space-y-1">
            <PasswordInput
              ref={passwordRef}
              id="password"
              name="password"
              placeholder={copy.passwordPlaceholder}
              value={formData.password}
              onChange={handleInputChange}
              error={errors.password}
              label={copy.passwordLabel}
              disabled={isLoading}
              required
            />
            {showForgotPasswordLink && (
              <div className="text-right">
                {onForgotPasswordClick ? (
                  <button
                    type="button"
                    onClick={onForgotPasswordClick}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    {copy.forgotPasswordLink}
                  </button>
                ) : (
                  <a
                    href={forgotPasswordHref}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    {copy.forgotPasswordLink}
                  </a>
                )}
              </div>
            )}
          </div>

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

      {showSignupLink && (
        <p className="text-center text-sm text-muted-foreground">
          {copy.signupPrompt}{' '}
          {onSignupClick ? (
            <button
              type="button"
              onClick={onSignupClick}
              className="font-medium text-primary hover:underline"
            >
              {copy.signupLink}
            </button>
          ) : (
            <a href={signupHref} className="font-medium text-primary hover:underline">
              {copy.signupLink}
            </a>
          )}
        </p>
      )}
    </form>
  )
}

LoginForm.displayName = 'LoginForm'
