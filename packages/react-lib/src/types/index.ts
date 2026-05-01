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

// ─── Shared lifecycle / error-mapping props ───────────────────────────────────

export interface FormLifecycleProps {
  /** Called immediately before the form submits to the server. */
  onSubmitStart?: () => void
  /** Called after the submit attempt finishes (success or error). */
  onSubmitComplete?: () => void
  /** Called when client-side validation finds errors. */
  onValidationError?: (errors: Record<string, string>) => void
  /** Map a server error to a user-facing message. */
  mapError?: (error: Error) => string
}

// ─── Password policy ──────────────────────────────────────────────────────────

export interface PasswordPolicyProps {
  /** Minimum password length (default: 8). */
  minPasswordLength?: number
  /** Require at least one uppercase letter (default: true). */
  requireUppercase?: boolean
  /** Require at least one lowercase letter (default: true). */
  requireLowercase?: boolean
  /** Require at least one number (default: true). */
  requireNumber?: boolean
  /** Require at least one special character (default: false). */
  requireSpecialChar?: boolean
}

// ─── Copy / i18n objects ──────────────────────────────────────────────────────

export interface LoginFormCopy {
  emailLabel?: string
  emailPlaceholder?: string
  passwordLabel?: string
  passwordPlaceholder?: string
  submitButton?: string
  loadingButton?: string
  orContinueWith?: string
  signupPrompt?: string
  signupLink?: string
  forgotPasswordLink?: string
  noMethodsMessage?: string
}

export interface SignupFormCopy {
  emailLabel?: string
  emailPlaceholder?: string
  passwordLabel?: string
  passwordPlaceholder?: string
  confirmPasswordLabel?: string
  confirmPasswordPlaceholder?: string
  submitButton?: string
  loadingButton?: string
  successMessage?: string
  orContinueWith?: string
  loginPrompt?: string
  loginLink?: string
  noMethodsMessage?: string
  passwordMismatch?: string
}

export interface ForgotPasswordFormCopy {
  emailLabel?: string
  emailPlaceholder?: string
  submitButton?: string
  loadingButton?: string
  successMessage?: string
}

export interface MagicLinkFormCopy {
  emailLabel?: string
  emailPlaceholder?: string
  submitButton?: string
  loadingButton?: string
  successMessage?: string
}

export interface ResetPasswordFormCopy {
  passwordLabel?: string
  passwordPlaceholder?: string
  confirmPasswordLabel?: string
  confirmPasswordPlaceholder?: string
  submitButton?: string
  loadingButton?: string
  successMessage?: string
  passwordMismatch?: string
}

export interface OTPFormCopy {
  emailLabel?: string
  emailPlaceholder?: string
  phoneLabel?: string
  phonePlaceholder?: string
  phoneHint?: string
  sendOtpButton?: string
  sendingOtpButton?: (method: 'email' | 'phone') => string
  verifyButton?: string
  verifyingButton?: string
  resendButton?: string
  resendCountdownText?: (seconds: number) => string
  otpLabel?: string
  otpPlaceholder?: string
  otpSubtext?: (contact: string) => string
  emailSuccessMessage?: string
  phoneSuccessMessage?: string
  changeEmailLink?: string
  changePhoneLink?: string
  noMethodsMessage?: string
}

// ─── Form prop interfaces ─────────────────────────────────────────────────────

export interface LoginFormProps extends FormLifecycleProps {
  onSuccess?: (user: AuthUser) => void
  onError?: (error: Error) => void
  showSignupLink?: boolean
  /** Callback when the user clicks the sign-up link (replaces the default <a> tag). */
  onSignupClick?: () => void
  /** Href for the sign-up link when no onSignupClick callback is provided. Defaults to "#signup". */
  signupHref?: string
  /** Callback when the user clicks the "forgot password" link. */
  onForgotPasswordClick?: () => void
  /** Href for the forgot password link when no onForgotPasswordClick callback is provided. Defaults to "#forgot-password". */
  forgotPasswordHref?: string
  /** Show a "Forgot password?" link below the password field. */
  showForgotPasswordLink?: boolean
  /** Override any displayed text. */
  copy?: LoginFormCopy
}

export interface MagicLinkFormProps extends FormLifecycleProps {
  onSuccess?: (email: string) => void
  onError?: (error: Error) => void
  redirectTo?: string
  /** Override any displayed text. */
  copy?: MagicLinkFormCopy
}

export interface ForgotPasswordFormProps extends FormLifecycleProps {
  onSuccess?: (email: string) => void
  onError?: (error: Error) => void
  redirectTo?: string
  /** Override any displayed text. */
  copy?: ForgotPasswordFormCopy
}

export interface ResetPasswordFormProps extends FormLifecycleProps, PasswordPolicyProps {
  onSuccess?: (user: AuthUser) => void
  onError?: (error: Error) => void
  /** Override any displayed text. */
  copy?: ResetPasswordFormCopy
}

export interface SignupFormProps extends FormLifecycleProps, PasswordPolicyProps {
  onSuccess?: (user: AuthUser) => void
  onError?: (error: Error) => void
  showLoginLink?: boolean
  /** Callback when the user clicks the login link (replaces the default <a> tag). */
  onLoginClick?: () => void
  /** Href for the login link when no onLoginClick callback is provided. Defaults to "#login". */
  loginHref?: string
  /** Override any displayed text. */
  copy?: SignupFormCopy
}

export interface OTPFormProps extends FormLifecycleProps {
  onSuccess?: (user: AuthUser) => void
  onError?: (error: Error) => void
  phoneNumber?: string
  defaultMethod?: 'email' | 'phone'
  enabledMethods?: {
    email?: boolean
    phone?: boolean
  }
  /** Seconds before the resend button re-enables (default: 60). */
  resendCountdownSeconds?: number
  /** Number of digits in the OTP code (default: 6). */
  otpLength?: number
  /** Automatically verify when the user enters the last digit. */
  autoSubmitOnComplete?: boolean
  /** Override any displayed text. */
  copy?: OTPFormCopy
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

// ─── Headless hook return types ───────────────────────────────────────────────

export interface UseLoginFormReturn {
  formData: { email: string; password: string }
  errors: Partial<{ email: string; password: string }>
  generalError: string | null
  isLoading: boolean
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleSubmit: (e: React.FormEvent) => Promise<void>
}

export interface UseSignupFormReturn {
  formData: { email: string; password: string; confirmPassword: string }
  errors: Partial<{ email: string; password: string; confirmPassword: string }>
  generalError: string | null
  successMessage: string | null
  isLoading: boolean
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleSubmit: (e: React.FormEvent) => Promise<void>
}

export interface UseOTPFlowReturn {
  step: 'contact' | 'otp'
  deliveryMethod: 'email' | 'phone'
  email: string
  phone: string
  otp: string
  isLoading: boolean
  generalError: string | null
  successMessage: string | null
  resendCountdown: number
  setDeliveryMethod: (method: 'email' | 'phone') => void
  setEmail: (email: string) => void
  setPhone: (phone: string) => void
  setOtp: (otp: string) => void
  handleSendOTP: () => Promise<void>
  handleVerifyOTP: () => Promise<void>
  goBack: () => void
}
