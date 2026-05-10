import { useCallback, useMemo, useState, type CSSProperties } from 'react'
import { AuthProvider, type AuthConfig } from '@authabase/react'
import { type ApiResponsesState, createDefaultDemoState } from './shared/demo-config'
import { parseResponseBody } from './shared/demo-utils'
import { DemoControls, ThemeControls } from './DemoPanels'
import { ProfileDemo } from './DemoAuthViews'

export default function App() {
  const [demoState, setDemoState] = useState(createDefaultDemoState)
  const [apiResponses, setApiResponses] = useState<ApiResponsesState>({
    requestOtp: null,
    verifyOtp: null,
    currentUser: null,
  })

  const demoThemeStyle = useMemo(
    () =>
      ({
        '--auth-bg': demoState.theme.background,
        '--auth-fg': demoState.theme.foreground,
        '--auth-primary': demoState.theme.primary,
        '--auth-primary-foreground': demoState.theme.primaryForeground,
        '--auth-surface': demoState.theme.surface,
        '--auth-border': demoState.theme.border,
        '--auth-muted-fg': demoState.theme.mutedForeground,
        '--auth-link': demoState.theme.link,
        '--auth-link-hover': demoState.theme.linkHover,
        '--auth-danger-bg': demoState.theme.dangerBackground,
        '--auth-danger-fg': demoState.theme.dangerForeground,
        '--auth-success-bg': demoState.theme.successBackground,
        '--auth-success-fg': demoState.theme.successForeground,
      }) as CSSProperties,
    [demoState.theme]
  )

  const getCurrentUser = useCallback(async () => {
    if (!demoState.useCookieSessionHydration || !demoState.currentUserApiUrl) {
      return null
    }

    const res = await fetch(demoState.currentUserApiUrl, {
      credentials: 'include',
    })

    const responseBody = await parseResponseBody(res)
    setApiResponses((prev) => ({
      ...prev,
      currentUser: {
        timestamp: new Date().toISOString(),
        method: 'GET',
        url: demoState.currentUserApiUrl,
        status: res.status,
        ok: res.ok,
        body: responseBody,
      },
    }))

    if (res.status === 401 || res.status === 403) {
      return null
    }

    if (!res.ok) {
      throw new Error(`Failed to load current user: ${res.status}`)
    }

    return responseBody as {
      id: string
      email?: string
      phone?: string
      user_metadata?: Record<string, unknown>
    }
  }, [demoState.currentUserApiUrl, demoState.useCookieSessionHydration])

  const authConfig: AuthConfig = useMemo(
    () => ({
      supabaseUrl: demoState.useSupabaseCredentials ? import.meta.env.VITE_SUPABASE_URL || '' : '',
      supabaseKey: demoState.useSupabaseCredentials ? import.meta.env.VITE_SUPABASE_KEY || '' : '',
      redirectUrl: window.location.origin,
      getCurrentUser:
        demoState.useCookieSessionHydration && Boolean(demoState.currentUserApiUrl)
          ? getCurrentUser
          : undefined,
      enabledMethods: demoState.enabledMethods,
      onAuthSuccess: () => {
        // Auth success
      },
      onAuthError: (error) => {
        console.error('Auth error:', error)
      },
    }),
    [
      demoState.enabledMethods,
      demoState.currentUserApiUrl,
      demoState.useCookieSessionHydration,
      demoState.useSupabaseCredentials,
      getCurrentUser,
    ]
  )

  const links = {
    npm: 'https://www.npmjs.com/package/%40authabase/react',
    github: 'https://github.com/jameshschuler/authabase',
    readme: 'https://github.com/jameshschuler/authabase/blob/main/README.md',
    contributing: 'https://github.com/jameshschuler/authabase/blob/main/CONTRIBUTING.md',
    changesets: 'https://github.com/jameshschuler/authabase/blob/main/changeset.md',
  }

  return (
    <div
      className="min-h-screen bg-(--auth-bg) px-4 py-6 text-(--auth-fg) sm:px-6"
      style={demoThemeStyle}
    >
      <div className="w-full space-y-8">
        <header className="rounded-xl border border-(--auth-border) bg-(--auth-surface) px-5 py-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-(--auth-muted-fg)">
                AuthABase
              </p>
              <h1 className="text-lg font-semibold text-(--auth-fg)">@authabase/react Demo</h1>
            </div>
            <nav className="flex flex-wrap gap-2 text-xs sm:text-sm">
              <a
                href={links.npm}
                target="_blank"
                rel="noreferrer"
                className="rounded border border-(--auth-border) px-3 py-1.5 hover:bg-[color-mix(in_srgb,var(--auth-surface)_80%,var(--auth-border))]"
              >
                npm
              </a>
              <a
                href={links.github}
                target="_blank"
                rel="noreferrer"
                className="rounded border border-(--auth-border) px-3 py-1.5 hover:bg-[color-mix(in_srgb,var(--auth-surface)_80%,var(--auth-border))]"
              >
                GitHub
              </a>
              <a
                href={links.readme}
                target="_blank"
                rel="noreferrer"
                className="rounded border border-(--auth-border) px-3 py-1.5 hover:bg-[color-mix(in_srgb,var(--auth-surface)_80%,var(--auth-border))]"
              >
                README
              </a>
              <a
                href={links.contributing}
                target="_blank"
                rel="noreferrer"
                className="rounded border border-(--auth-border) px-3 py-1.5 hover:bg-[color-mix(in_srgb,var(--auth-surface)_80%,var(--auth-border))]"
              >
                Contributing
              </a>
              <a
                href={links.changesets}
                target="_blank"
                rel="noreferrer"
                className="rounded border border-(--auth-border) px-3 py-1.5 hover:bg-[color-mix(in_srgb,var(--auth-surface)_80%,var(--auth-border))]"
              >
                Changesets
              </a>
            </nav>
          </div>
        </header>

        <section className="rounded-xl border border-(--auth-border) bg-(--auth-surface) px-5 py-8 shadow-sm">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-(--auth-muted-fg)">
            React Authentication Component Library
          </p>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">@authabase/react</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-(--auth-muted-fg) sm:text-base">
            Reusable React authentication components with Supabase integration, shadcn-style UI, and
            configurable auth methods. Use the live controls below to test flows, customize copy,
            and preview themes before integrating.
          </p>
        </section>

        <div className="grid w-full gap-6 xl:grid-cols-[360px_minmax(0,1fr)_360px]">
          <aside className="order-1 xl:sticky xl:top-6 xl:self-start">
            <ThemeControls demoState={demoState} setDemoState={setDemoState} />
          </aside>

          <div className="order-2 min-w-0 xl:col-start-2 xl:justify-self-center xl:w-full">
            <AuthProvider config={authConfig}>
              <ProfileDemo demoState={demoState} setApiResponses={setApiResponses} />
            </AuthProvider>
          </div>

          <aside className="order-3 xl:sticky xl:top-6 xl:self-start">
            <DemoControls
              demoState={demoState}
              setDemoState={setDemoState}
              apiResponses={apiResponses}
              setApiResponses={setApiResponses}
            />
          </aside>
        </div>

        <footer className="rounded-xl border border-(--auth-border) bg-(--auth-surface) px-5 py-4 text-sm text-(--auth-muted-fg) shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p>
              Built with <span className="font-medium text-(--auth-fg)">@authabase/react</span> for
              production-ready authentication UX.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href={links.npm} target="_blank" rel="noreferrer" className="hover:underline">
                npm package
              </a>
              <a href={links.github} target="_blank" rel="noreferrer" className="hover:underline">
                GitHub repo
              </a>
              <a href={links.readme} target="_blank" rel="noreferrer" className="hover:underline">
                README
              </a>
              <a
                href={links.contributing}
                target="_blank"
                rel="noreferrer"
                className="hover:underline"
              >
                Contributing guide
              </a>
              <a
                href={links.changesets}
                target="_blank"
                rel="noreferrer"
                className="hover:underline"
              >
                Changeset log
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
