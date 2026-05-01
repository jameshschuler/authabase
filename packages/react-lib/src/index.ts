// Types
export * from './types'

// Provider
export { AuthProvider, useAuth } from './provider'

// Components
export {
  LoginForm,
  SignupForm,
  OTPForm,
  MagicLinkForm,
  ForgotPasswordForm,
  ResetPasswordForm,
  SocialAuthButton,
  AuthContainer,
  PasswordInput,
  EmailInput,
} from './components'

// Headless hooks
export { useLoginForm, useSignupForm, useOTPFlow } from './hooks'

// Utils
export { createSupabaseClient } from './utils'
