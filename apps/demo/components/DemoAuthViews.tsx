import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react'
import {
  AuthContainer,
  ForgotPasswordForm,
  LoginForm,
  MagicLinkForm,
  OTPForm,
  ResetPasswordForm,
  SignupForm,
  useAuth,
} from '@authabase/react'
import { type AuthTab, type DemoState, type ApiResponsesState } from './shared/demo-config'
import { parseResponseBody } from './shared/demo-utils'

function AuthDemo({
  demoState,
  setApiResponses,
}: {
  demoState: DemoState
  setApiResponses: Dispatch<SetStateAction<ApiResponsesState>>
}) {
  const [tab, setTab] = useState<AuthTab>('login')

  const mockRequestOTP = async (payload: {
    method: 'email' | 'phone'
    email?: string
    phone?: string
  }) => {
    const res = await fetch(demoState.otpApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    })

    const responseBody = await parseResponseBody(res)
    setApiResponses((prev) => ({
      ...prev,
      requestOtp: {
        timestamp: new Date().toISOString(),
        method: 'POST',
        url: demoState.otpApiUrl,
        status: res.status,
        ok: res.ok,
        body: responseBody,
      },
    }))

    if (!res.ok) {
      const data = (responseBody ?? {}) as { message?: string }
      throw new Error(data.message ?? `Request failed: ${res.status}`)
    }
  }

  const mockVerifyOTP = async (payload: {
    method: 'email' | 'phone'
    email?: string
    phone?: string
    token: string
  }) => {
    const verifyUrl = demoState.otpVerifyApiUrl || demoState.otpApiUrl
    const res = await fetch(verifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    })

    const responseBody = await parseResponseBody(res)
    setApiResponses((prev) => ({
      ...prev,
      verifyOtp: {
        timestamp: new Date().toISOString(),
        method: 'POST',
        url: verifyUrl,
        status: res.status,
        ok: res.ok,
        body: responseBody,
      },
    }))

    if (!res.ok) {
      const data = (responseBody ?? {}) as { message?: string }
      throw new Error(data.message ?? `Verification failed: ${res.status}`)
    }

    if (responseBody && typeof responseBody === 'object') {
      return responseBody as {
        id: string
        email?: string
        phone?: string
        user_metadata?: Record<string, unknown>
      }
    }

    return undefined
  }

  const tabs = useMemo(
    () => [
      {
        id: 'login' as AuthTab,
        label: 'Sign In',
        enabled:
          Boolean(demoState.enabledMethods.email) ||
          Boolean(demoState.enabledMethods.google) ||
          Boolean(demoState.enabledMethods.github),
      },
      {
        id: 'signup' as AuthTab,
        label: 'Sign Up',
        enabled:
          Boolean(demoState.enabledMethods.email) ||
          Boolean(demoState.enabledMethods.google) ||
          Boolean(demoState.enabledMethods.github),
      },
      {
        id: 'otp' as AuthTab,
        label: 'OTP',
        enabled: Boolean(demoState.enabledMethods.otp),
      },
      {
        id: 'magic-link' as AuthTab,
        label: 'Magic Link',
        enabled: Boolean(demoState.enabledMethods.email),
      },
      {
        id: 'forgot-password' as AuthTab,
        label: 'Forgot Password',
        enabled: Boolean(demoState.enabledMethods.email),
      },
      {
        id: 'reset-password' as AuthTab,
        label: 'Reset Password',
        enabled: Boolean(demoState.enabledMethods.email),
      },
    ],
    [demoState.enabledMethods]
  )

  const availableTabs = tabs.filter((item) => item.enabled)

  useEffect(() => {
    if (!availableTabs.find((item) => item.id === tab) && availableTabs.length > 0) {
      setTab(availableTabs[0].id)
    }
  }, [availableTabs, tab])

  return (
    <AuthContainer title="Authentication Demo" subtitle="Try different authentication methods">
      <div className="mb-6 flex flex-wrap gap-2 border-b border-[var(--auth-border)] pb-2">
        {availableTabs.map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={`whitespace-nowrap px-4 py-2 font-medium transition-colors ${
              tab === item.id
                ? 'border-b-2 border-[var(--auth-primary)] text-[var(--auth-primary)]'
                : 'text-[var(--auth-muted-fg)] hover:text-[var(--auth-fg)]'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'login' && (
        <LoginForm
          onSuccess={(user) => alert(`Logged in as ${user.email}`)}
          onError={(error) => alert(`Error: ${error.message}`)}
          showSignupLink={demoState.showSignupLink}
        />
      )}

      {tab === 'signup' && (
        <SignupForm
          onSuccess={(user) => alert(`Account created for ${user.email}`)}
          onError={(error) => alert(`Error: ${error.message}`)}
          showLoginLink={demoState.showLoginLink}
          minPasswordLength={demoState.minPasswordLength}
          copy={{ passwordMismatch: demoState.passwordMismatchText }}
        />
      )}

      {tab === 'otp' && (
        <OTPForm
          onSuccess={(user) =>
            alert(`Logged in with OTP as ${user.email || user.phone || 'verified user'}`)
          }
          onVerified={() => {
            if (demoState.useCookieSessionHydration) {
              alert('OTP verified. Session cookie set; user is hydrated via getCurrentUser.')
            }
          }}
          onError={(error) => alert(`Error: ${error.message}`)}
          onRequestOTP={demoState.useCustomOtpApi ? mockRequestOTP : undefined}
          onVerifyOTP={demoState.useCustomOtpApi ? mockVerifyOTP : undefined}
          enabledMethods={demoState.otpMethods}
          copy={{
            phoneHint: demoState.otpHintText,
            sendOtpButton: demoState.otpSendText,
          }}
          defaultMethod={
            demoState.otpMethods.phone && !demoState.otpMethods.email ? 'phone' : 'email'
          }
        />
      )}

      {tab === 'magic-link' && (
        <MagicLinkForm
          onSuccess={(email) => alert(`Magic link sent to ${email}. Check your inbox!`)}
          onError={(error) => alert(`Error: ${error.message}`)}
          redirectTo={window.location.origin}
        />
      )}

      {tab === 'forgot-password' && (
        <ForgotPasswordForm
          onSuccess={(email) => alert(`Reset link sent to ${email}. Check your inbox!`)}
          onError={(error) => alert(`Error: ${error.message}`)}
          redirectTo={window.location.origin}
        />
      )}

      {tab === 'reset-password' && (
        <ResetPasswordForm
          onSuccess={(user) => alert(`Password updated for ${user.email || 'your account'}`)}
          onError={(error) => alert(`Error: ${error.message}`)}
          minPasswordLength={demoState.minPasswordLength}
          copy={{ passwordMismatch: demoState.passwordMismatchText }}
        />
      )}
    </AuthContainer>
  )
}

export function ProfileDemo({
  demoState,
  setApiResponses,
}: {
  demoState: DemoState
  setApiResponses: Dispatch<SetStateAction<ApiResponsesState>>
}) {
  const { user, isLoading, error, signOut, refreshSession } = useAuth()

  const handleLogout = async () => {
    if (demoState.useCookieSessionHydration && demoState.currentUserApiUrl) {
      const res = await fetch(demoState.currentUserApiUrl, {
        method: 'DELETE',
        credentials: 'include',
      })

      const responseBody = await parseResponseBody(res)
      setApiResponses((prev) => ({
        ...prev,
        currentUser: {
          timestamp: new Date().toISOString(),
          method: 'DELETE',
          url: demoState.currentUserApiUrl,
          status: res.status,
          ok: res.ok,
          body: responseBody,
        },
      }))

      if (!res.ok) {
        const data = (responseBody ?? {}) as { message?: string }
        throw new Error(data.message ?? `Logout failed: ${res.status}`)
      }

      await refreshSession()
      return
    }

    await signOut()
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-[var(--auth-muted-fg)]">Loading...</p>
      </div>
    )
  }

  if (user) {
    return (
      <div className="mx-auto flex w-full max-w-2xl items-center justify-center py-10">
        <AuthContainer
          title="Session Active"
          subtitle="A user session is still available. The demo form is replaced until you log out."
          className="w-full shadow-md"
        >
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--auth-border)] bg-[var(--auth-surface)] px-4 py-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--auth-muted-fg)]">
                  Logged In
                </p>
                <p className="mt-1 text-sm text-[var(--auth-fg)]">
                  Cookie-backed or Supabase-backed session detected.
                </p>
              </div>
              <span className="inline-flex flex-none items-center whitespace-nowrap rounded-full border border-[color-mix(in_srgb,var(--auth-primary)_35%,transparent)] bg-[color-mix(in_srgb,var(--auth-primary)_10%,var(--auth-surface))] px-4 py-1.5 text-xs font-semibold leading-none text-[var(--auth-primary)]">
                Session Active
              </span>
            </div>

            <div className="grid gap-3 rounded-xl border border-[var(--auth-border)] bg-[var(--auth-surface)] px-4 py-4 sm:grid-cols-2">
              <div className="rounded-lg bg-[color-mix(in_srgb,var(--auth-surface)_92%,var(--auth-border))] p-3">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--auth-muted-fg)]">
                  Email
                </p>
                <p className="mt-1 break-words font-medium text-[var(--auth-fg)]">
                  {user.email || 'No email provided'}
                </p>
              </div>
              <div className="rounded-lg bg-[color-mix(in_srgb,var(--auth-surface)_92%,var(--auth-border))] p-3">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--auth-muted-fg)]">
                  User ID
                </p>
                <p className="mt-1 break-all font-mono text-sm text-[var(--auth-fg)]">{user.id}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => {
                  void handleLogout()
                }}
                className="w-full rounded-md bg-[var(--auth-danger-fg)] px-4 py-2.5 text-[var(--auth-primary-foreground)] transition-opacity hover:opacity-90 sm:flex-1"
              >
                Log Out
              </button>
            </div>
          </div>
        </AuthContainer>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="auth-error rounded-md border p-4">
          <p className="text-sm">
            <strong>Demo Mode:</strong> {error.message}
          </p>
          <p className="mt-1 text-xs opacity-90">
            Click on the tabs below to explore the component library.
          </p>
        </div>
        <AuthDemo demoState={demoState} setApiResponses={setApiResponses} />
      </div>
    )
  }

  return <AuthDemo demoState={demoState} setApiResponses={setApiResponses} />
}
