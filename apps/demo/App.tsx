import { useEffect, useMemo, useState } from 'react'
import {
  AuthProvider,
  useAuth,
  LoginForm,
  SignupForm,
  OTPForm,
  MagicLinkForm,
  ForgotPasswordForm,
  ResetPasswordForm,
  AuthContainer,
  type AuthConfig,
} from '@authabase/react'

type AuthTab = 'login' | 'signup' | 'otp' | 'magic-link' | 'forgot-password' | 'reset-password'

type EnabledMethods = NonNullable<AuthConfig['enabledMethods']>

interface DemoState {
  useSupabaseCredentials: boolean
  enabledMethods: EnabledMethods
  minPasswordLength: number
  otpMethods: {
    email: boolean
    phone: boolean
  }
  showSignupLink: boolean
  showLoginLink: boolean
}

type ConfigPreset = 'all' | 'email-only' | 'social-only' | 'otp-only'

const defaultEnabledMethods: EnabledMethods = {
  email: true,
  google: true,
  github: true,
  otp: true,
}

function AuthDemo({ demoState }: { demoState: DemoState }) {
  const [tab, setTab] = useState<AuthTab>('login')

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
      <div className="mb-6 flex gap-2 border-b border-border">
        {availableTabs.map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={`px-4 py-2 font-medium transition-colors ${
              tab === item.id
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
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
        />
      )}

      {tab === 'otp' && (
        <OTPForm
          onSuccess={(user) =>
            alert(`Logged in with OTP as ${user.email || user.phone || 'verified user'}`)
          }
          onError={(error) => alert(`Error: ${error.message}`)}
          enabledMethods={demoState.otpMethods}
          defaultMethod={demoState.otpMethods.phone && !demoState.otpMethods.email ? 'phone' : 'email'}
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
        />
      )}
    </AuthContainer>
  )
}

function ProfileDemo({ demoState }: { demoState: DemoState }) {
  const { user, isLoading, error, signOut } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  // Show demo UI if no valid credentials are configured or user isn't logged in
  if (error || !user) {
    return (
      <div className="space-y-6">
        {error && (
          <div className="rounded-md bg-amber-50 border border-amber-200 p-4">
            <p className="text-sm text-amber-800">
              <strong>Demo Mode:</strong> {error.message}
            </p>
            <p className="text-xs text-amber-700 mt-1">
              Click on the tabs below to explore the component library.
            </p>
          </div>
        )}
        <AuthDemo demoState={demoState} />
      </div>
    )
  }

  return (
    <AuthContainer title="Profile">
      <div className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Email</p>
          <p className="font-medium">{user.email}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">User ID</p>
          <p className="font-medium font-mono text-sm">{user.id}</p>
        </div>
        <button
          onClick={signOut}
          className="w-full px-4 py-2 rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90"
        >
          Sign Out
        </button>
      </div>
    </AuthContainer>
  )
}

function DemoControls({
  demoState,
  setDemoState,
}: {
  demoState: DemoState
  setDemoState: React.Dispatch<React.SetStateAction<DemoState>>
}) {
  const setEnabledMethod = (method: keyof EnabledMethods, enabled: boolean) => {
    setDemoState((prev) => ({
      ...prev,
      enabledMethods: {
        ...prev.enabledMethods,
        [method]: enabled,
      },
    }))
  }

  const applyPreset = (preset: ConfigPreset) => {
    setDemoState((prev) => {
      if (preset === 'email-only') {
        return {
          ...prev,
          enabledMethods: {
            email: true,
            google: false,
            github: false,
            otp: false,
          },
          showSignupLink: true,
          showLoginLink: true,
          otpMethods: {
            email: true,
            phone: true,
          },
          minPasswordLength: 8,
        }
      }

      if (preset === 'social-only') {
        return {
          ...prev,
          enabledMethods: {
            email: false,
            google: true,
            github: true,
            otp: false,
          },
          showSignupLink: false,
          showLoginLink: false,
          otpMethods: {
            email: true,
            phone: true,
          },
          minPasswordLength: 8,
        }
      }

      if (preset === 'otp-only') {
        return {
          ...prev,
          enabledMethods: {
            email: false,
            google: false,
            github: false,
            otp: true,
          },
          showSignupLink: false,
          showLoginLink: false,
          otpMethods: {
            email: true,
            phone: true,
          },
          minPasswordLength: 8,
        }
      }

      return {
        ...prev,
        enabledMethods: { ...defaultEnabledMethods },
        showSignupLink: true,
        showLoginLink: true,
        otpMethods: {
          email: true,
          phone: true,
        },
        minPasswordLength: 8,
      }
    })
  }

  const activePreset = useMemo<ConfigPreset>(() => {
    const { email, google, github, otp } = demoState.enabledMethods
    if (email && !google && !github && !otp) return 'email-only'
    if (!email && google && github && !otp) return 'social-only'
    if (!email && !google && !github && otp) return 'otp-only'
    return 'all'
  }, [demoState.enabledMethods])

  const presetButtonClass = (preset: ConfigPreset) =>
    `rounded border px-3 py-1.5 text-xs font-medium transition-colors ${
      activePreset === preset
        ? 'border-primary bg-primary text-primary-foreground'
        : 'border-border text-foreground hover:bg-muted'
    }`

  return (
    <div className="mx-auto mb-6 w-full max-w-3xl rounded-lg border border-border bg-card p-4">
      <h2 className="mb-3 text-sm font-semibold text-foreground">Demo Controls</h2>

      <div className="mb-4 flex flex-wrap gap-2">
        <button type="button" className={presetButtonClass('all')} onClick={() => applyPreset('all')}>
          All Methods
        </button>
        <button
          type="button"
          className={presetButtonClass('email-only')}
          onClick={() => applyPreset('email-only')}
        >
          Email Only
        </button>
        <button
          type="button"
          className={presetButtonClass('social-only')}
          onClick={() => applyPreset('social-only')}
        >
          Social Only
        </button>
        <button
          type="button"
          className={presetButtonClass('otp-only')}
          onClick={() => applyPreset('otp-only')}
        >
          OTP Only
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={demoState.useSupabaseCredentials}
            onChange={(e) =>
              setDemoState((prev) => ({
                ...prev,
                useSupabaseCredentials: e.target.checked,
              }))
            }
          />
          Use Supabase credentials
        </label>

        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={Boolean(demoState.enabledMethods.email)}
            onChange={(e) => setEnabledMethod('email', e.target.checked)}
          />
          Email/Password
        </label>

        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={Boolean(demoState.enabledMethods.google)}
            onChange={(e) => setEnabledMethod('google', e.target.checked)}
          />
          Google OAuth
        </label>

        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={Boolean(demoState.enabledMethods.github)}
            onChange={(e) => setEnabledMethod('github', e.target.checked)}
          />
          GitHub OAuth
        </label>

        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={Boolean(demoState.enabledMethods.otp)}
            onChange={(e) => setEnabledMethod('otp', e.target.checked)}
          />
          OTP
        </label>

        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={demoState.otpMethods.email}
            onChange={(e) =>
              setDemoState((prev) => ({
                ...prev,
                otpMethods: {
                  ...prev.otpMethods,
                  email: e.target.checked,
                },
              }))
            }
          />
          OTP via Email
        </label>

        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={demoState.otpMethods.phone}
            onChange={(e) =>
              setDemoState((prev) => ({
                ...prev,
                otpMethods: {
                  ...prev.otpMethods,
                  phone: e.target.checked,
                },
              }))
            }
          />
          OTP via Phone
        </label>

        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={demoState.showSignupLink}
            onChange={(e) =>
              setDemoState((prev) => ({
                ...prev,
                showSignupLink: e.target.checked,
              }))
            }
          />
          Show Sign Up Link
        </label>

        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={demoState.showLoginLink}
            onChange={(e) =>
              setDemoState((prev) => ({
                ...prev,
                showLoginLink: e.target.checked,
              }))
            }
          />
          Show Login Link
        </label>

        <div className="flex flex-col gap-1 text-sm text-foreground">
          <label htmlFor="minPasswordLength">Min Password Length</label>
          <div className="flex items-center gap-2">
            <input
              id="minPasswordLength"
              type="range"
              min={4}
              max={32}
              value={demoState.minPasswordLength}
              onChange={(e) =>
                setDemoState((prev) => ({
                  ...prev,
                  minPasswordLength: Number(e.target.value),
                }))
              }
              className="w-full"
            />
            <input
              type="number"
              min={4}
              max={32}
              value={demoState.minPasswordLength}
              onChange={(e) => {
                const value = Number(e.target.value)
                if (Number.isNaN(value)) return
                setDemoState((prev) => ({
                  ...prev,
                  minPasswordLength: Math.min(32, Math.max(4, value)),
                }))
              }}
              className="w-16 rounded border border-border bg-background px-2 py-1 text-xs"
            />
          </div>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          className="rounded border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
          onClick={() =>
            setDemoState({
              useSupabaseCredentials: false,
              enabledMethods: { ...defaultEnabledMethods },
              otpMethods: {
                email: true,
                phone: true,
              },
              minPasswordLength: 8,
              showSignupLink: true,
              showLoginLink: true,
            })
          }
        >
          Reset Defaults
        </button>
      </div>
    </div>
  )
}

export default function App() {
  const [demoState, setDemoState] = useState<DemoState>({
    useSupabaseCredentials: false,
    enabledMethods: { ...defaultEnabledMethods },
    minPasswordLength: 8,
    otpMethods: {
      email: true,
      phone: true,
    },
    showSignupLink: true,
    showLoginLink: true,
  })

  const authConfig: AuthConfig = {
    supabaseUrl: demoState.useSupabaseCredentials ? (import.meta.env.VITE_SUPABASE_URL || '') : '',
    supabaseKey: demoState.useSupabaseCredentials ? (import.meta.env.VITE_SUPABASE_KEY || '') : '',
    redirectUrl: window.location.origin,
    enabledMethods: demoState.enabledMethods,
    onAuthSuccess: () => {
      // Auth success
    },
    onAuthError: (error) => {
      console.error('Auth error:', error)
    },
  }

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6">
      <DemoControls demoState={demoState} setDemoState={setDemoState} />
      <AuthProvider config={authConfig}>
        <ProfileDemo demoState={demoState} />
      </AuthProvider>
    </div>
  )
}
