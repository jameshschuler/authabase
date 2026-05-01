import { useState } from 'react'
import { z } from 'zod'
import { useAuth } from '../provider'
import type { AuthUser, SignupFormProps, UseSignupFormReturn } from '../types'

type SignupFormData = { email: string; password: string; confirmPassword: string }

/**
 * Headless hook for signup form logic.
 * Use this when you want full control over the UI.
 */
export function useSignupForm({
  onSuccess,
  onError,
  onSubmitStart,
  onSubmitComplete,
  onValidationError,
  mapError,
  minPasswordLength = 8,
  requireUppercase = true,
  requireLowercase = true,
  requireNumber = true,
  requireSpecialChar = false,
}: Pick<
  SignupFormProps,
  | 'onSuccess'
  | 'onError'
  | 'onSubmitStart'
  | 'onSubmitComplete'
  | 'onValidationError'
  | 'mapError'
  | 'minPasswordLength'
  | 'requireUppercase'
  | 'requireLowercase'
  | 'requireNumber'
  | 'requireSpecialChar'
> = {}): UseSignupFormReturn {
  const { supabase } = useAuth()
  const minLength = Math.max(1, minPasswordLength)
  const passwordMismatch = 'Passwords do not match'

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
      message: passwordMismatch,
      path: ['confirmPassword'],
    })

  const [formData, setFormData] = useState<SignupFormData>({
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
    const nextFormData = { ...formData, [name]: value }
    setFormData(nextFormData)

    if (nextFormData.confirmPassword && nextFormData.password !== nextFormData.confirmPassword) {
      setErrors((prev) => ({ ...prev, [name]: undefined, confirmPassword: passwordMismatch }))
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
      setErrors({ confirmPassword: passwordMismatch })
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

      setSuccessMessage('Sign up successful! Check your email for verification.')
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

  return {
    formData,
    errors,
    generalError,
    successMessage,
    isLoading,
    handleInputChange,
    handleSubmit,
  }
}
