import { useState } from 'react'
import { z } from 'zod'
import { useAuth } from '../provider'
import type { AuthUser, LoginFormProps, UseLoginFormReturn } from '../types'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormData = z.infer<typeof loginSchema>

/**
 * Headless hook for login form logic.
 * Use this when you want full control over the UI.
 */
export function useLoginForm({
  onSuccess,
  onError,
  onSubmitStart,
  onSubmitComplete,
  onValidationError,
  mapError,
}: Pick<
  LoginFormProps,
  'onSuccess' | 'onError' | 'onSubmitStart' | 'onSubmitComplete' | 'onValidationError' | 'mapError'
> = {}): UseLoginFormReturn {
  const { supabase } = useAuth()
  const [formData, setFormData] = useState<LoginFormData>({ email: '', password: '' })
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

  const handleSubmit = async (e: React.FormEvent) => {
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

  return { formData, errors, generalError, isLoading, handleInputChange, handleSubmit }
}
