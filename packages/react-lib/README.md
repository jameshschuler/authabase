# AuthABase React Library

Reusable, type-safe React authentication components with Supabase integration, Tailwind-powered styling, and configurable auth flows.

## What Is Included

- AuthProvider and useAuth
- Auth forms: LoginForm, SignupForm, OTPForm, MagicLinkForm, ForgotPasswordForm, ResetPasswordForm
- UI and helpers: SocialAuthButton, AuthContainer, EmailInput, PasswordInput
- Headless hooks: useLoginForm, useSignupForm, useOTPFlow
- Utility: createSupabaseClient

## Core Features

- Email/password authentication
- Google OAuth and GitHub OAuth
- OTP via email or phone
- Magic link sign-in
- Forgot password and reset password flows
- Configurable enabled auth methods
- TypeScript-first API
- Built-in Google/GitHub SVG icons for social auth buttons
- Form lifecycle hooks and error mapping
- Per-form copy overrides for i18n/custom UX text

## Installation

Install package:

```bash
npm install @authabase/react
```

Install peer dependencies:

```bash
npm install react react-dom tailwindcss@^4
```

This library supports Tailwind CSS 4.x.

Import package styles once in your app entry:

```tsx
import '@authabase/react/styles.css'
```

The components work out of the box with built-in default styles. Overriding the theme is optional.

## Quick Start

```tsx
import { AuthProvider, AuthContainer, LoginForm } from '@authabase/react'

export function App() {
  return (
    <AuthProvider
      config={{
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
        supabaseKey: import.meta.env.VITE_SUPABASE_KEY,
        redirectUrl: window.location.origin,
        enabledMethods: {
          email: true,
          google: true,
          github: true,
          otp: true,
        },
      }}
    >
      <AuthContainer title="Welcome Back" subtitle="Sign in to continue">
        <LoginForm showSignupLink showForgotPasswordLink />
      </AuthContainer>
    </AuthProvider>
  )
}
```

## API Highlights

### AuthProvider Config

```ts
interface AuthConfig {
  supabaseUrl: string
  supabaseKey: string
  redirectUrl?: string
  enabledMethods?: Partial<{
    email: boolean
    google: boolean
    github: boolean
    otp: boolean
  }>
  onAuthSuccess?: (user: AuthUser) => void
  onAuthError?: (error: Error) => void
}
```

### Login and Signup Navigation

LoginForm supports:

- showSignupLink
- onSignupClick
- signupHref
- showForgotPasswordLink
- onForgotPasswordClick
- forgotPasswordHref

SignupForm supports:

- showLoginLink
- onLoginClick
- loginHref

### OTPForm

OTPForm supports both Supabase-backed OTP and custom backend callbacks.

- strategy.mode: supabase (default) or custom
- strategy.requestOTP(payload) and strategy.verifyOTP(payload) for custom mode
- options.enabledMethods for OTP delivery: email, phone
- options.resendCountdownSeconds
- options.otpLength
- options.otpInputMode: segmented (default) or single
- options.autoSubmitOnComplete

Example with custom OTP backend:

```tsx
import { OTPForm } from '@authabase/react'

export function CustomOtp() {
  return (
    <OTPForm
      options={{
        otpInputMode: 'segmented',
        otpLength: 6,
      }}
      strategy={{
        mode: 'custom',
        requestOTP: async (payload) => {
          await fetch('https://api.example.com/otp/request', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
        },
        verifyOTP: async (payload) => {
          const res = await fetch('https://api.example.com/otp/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
          if (!res.ok) throw new Error('OTP verification failed')
          return (await res.json()) as {
            id: string
            email?: string
            phone?: string
            user_metadata?: Record<string, unknown>
          }
        },
      }}
    />
  )
}
```

### Shared Form Lifecycle Props

All form components support:

- onSubmitStart
- onSubmitComplete
- onValidationError
- mapError

### Password Policy Props

SignupForm and ResetPasswordForm support:

- minPasswordLength
- requireUppercase
- requireLowercase
- requireNumber
- requireSpecialChar

### Copy Overrides

All auth forms support a copy prop so labels, button text, prompts, and status messages can be customized.

## Headless Hooks

```tsx
import { useLoginForm, useSignupForm, useOTPFlow } from '@authabase/react'
```

These hooks expose state, validation, and submit handlers so you can build fully custom UIs while keeping auth logic in one place.

## Component Exports

Primary package entry exports:

- Types
- AuthProvider, useAuth
- LoginForm, SignupForm, OTPForm, MagicLinkForm, ForgotPasswordForm, ResetPasswordForm
- SocialAuthButton, AuthContainer
- EmailInput, PasswordInput
- useLoginForm, useSignupForm, useOTPFlow
- createSupabaseClient

Lower-level UI primitives such as InputOTP are available from the components entrypoint:

```ts
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@authabase/react/components'
```

## Theming

The library ships with default auth styles, so consumers do not need to define shadcn-style theme tokens just to make components render correctly.

To match your app theme, override the `--auth-*` variables in your global CSS after importing `@authabase/react/styles.css`.

```css
:root {
  --auth-primary: #2563eb;
  --auth-primary-foreground: #ffffff;
  --auth-surface: #ffffff;
  --auth-border: #cbd5e1;
  --auth-muted-fg: #64748b;
  --auth-link: #2563eb;
  --auth-link-hover: #1d4ed8;
  --auth-danger-bg: #fff1f2;
  --auth-danger-fg: #be123c;
  --auth-success-bg: #ecfdf5;
  --auth-success-fg: #047857;
}
```

Most consumers only need a few variables:

- `--auth-primary`
- `--auth-primary-foreground`
- `--auth-surface`
- `--auth-border`
- `--auth-link`
- `--auth-link-hover`

The remaining `--auth-*` variables control muted text, inputs, social buttons, success states, and error states.

## Development

From the package folder:

```bash
npm install
npm run dev
npm run type-check
npm run test
npm run build
```

## Publishing Scripts

The package includes helper scripts for release flow:

- release:whoami
- release:check
- release:dry-run
- release:publish

Example:

```bash
npm run release:dry-run --workspace @authabase/react
npm run release:publish --workspace @authabase/react -- --otp=123456
```

## License

MIT
