import type { SupabaseClient } from '@supabase/supabase-js'

export type AuthMethod = 'email' | 'google' | 'github' | 'otp'

export interface AuthEnabledMethods {
  email: boolean
  google: boolean
  github: boolean
  otp: boolean
}

export interface AuthConfig {
  supabaseUrl: string
  supabaseKey: string
  redirectUrl?: string
  enabledMethods?: Partial<AuthEnabledMethods>
  onAuthSuccess?: (user: AuthUser) => void
  onAuthError?: (error: Error) => void
}

export interface AuthUser {
  id: string
  email?: string
  phone?: string
  user_metadata?: Record<string, any>
}

export interface AuthContextType {
  user: AuthUser | null
  supabase: SupabaseClient | null
  enabledMethods: AuthEnabledMethods
  isLoading: boolean
  error: Error | null
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}

export interface LoginFormProps {
  onSuccess?: (user: AuthUser) => void
  onError?: (error: Error) => void
  showSignupLink?: boolean
}

export interface MagicLinkFormProps {
  onSuccess?: (email: string) => void
  onError?: (error: Error) => void
  redirectTo?: string
}

export interface ForgotPasswordFormProps {
  onSuccess?: (email: string) => void
  onError?: (error: Error) => void
  redirectTo?: string
}

export interface ResetPasswordFormProps {
  onSuccess?: (user: AuthUser) => void
  onError?: (error: Error) => void
  minPasswordLength?: number
}

export interface SignupFormProps {
  onSuccess?: (user: AuthUser) => void
  onError?: (error: Error) => void
  showLoginLink?: boolean
  minPasswordLength?: number
}

export interface OTPFormProps {
  onSuccess?: (user: AuthUser) => void
  onError?: (error: Error) => void
  phoneNumber?: string
  defaultMethod?: 'email' | 'phone'
  enabledMethods?: {
    email?: boolean
    phone?: boolean
  }
}

export interface SocialAuthButtonProps {
  provider: 'google' | 'github'
  onSuccess?: (user: AuthUser) => void
  onError?: (error: Error) => void
  className?: string
}

export interface AuthContainerProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  className?: string
}

export interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  showStrengthIndicator?: boolean
}

export interface EmailInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}
