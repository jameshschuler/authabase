import { demoEnvDefaults, panelInputClass, panelSectionTitleClass } from '../../shared/demo-config'
import { ToggleField } from '../ToggleField'
import { type DemoControlsStateProps } from './types'

export function IntegrationSection({ demoState, setDemoState }: DemoControlsStateProps) {
  return (
    <>
      <section>
        <p className={`${panelSectionTitleClass} mb-3`}>Integration</p>
        <div className="space-y-2">
          <ToggleField
            checked={demoState.useSupabaseCredentials}
            onChange={(checked) =>
              setDemoState((prev) => ({
                ...prev,
                useSupabaseCredentials: checked,
              }))
            }
            label="Use Supabase credentials"
            description="Enable real Supabase auth instead of preview-only mode."
          />
          <ToggleField
            checked={demoState.useCustomOtpApi}
            onChange={(checked) =>
              setDemoState((prev) => ({
                ...prev,
                useCustomOtpApi: checked,
              }))
            }
            label="Use external OTP API callbacks"
            description="Route OTP request and verification through custom endpoints."
          />
          <button
            type="button"
            onClick={() =>
              setDemoState((prev) => ({
                ...prev,
                useCookieSessionHydration: !prev.useCookieSessionHydration,
              }))
            }
            className={`flex w-full items-start justify-between gap-3 rounded-md border px-3 py-2.5 text-left transition-colors ${
              demoState.useCookieSessionHydration
                ? 'border-(--auth-primary) bg-[color-mix(in_srgb,var(--auth-primary)_10%,var(--auth-surface))]'
                : 'border-(--auth-border) bg-(--auth-surface) hover:bg-[color-mix(in_srgb,var(--auth-surface)_80%,var(--auth-border))]'
            }`}
          >
            <span className="min-w-0">
              <span className="block text-sm font-medium text-(--auth-fg)">
                Hydrate user from cookie session
              </span>
              <span className="mt-0.5 block text-xs text-(--auth-muted-fg)">
                Calls getCurrentUser after OTP verify and during refresh to populate useAuth().user.
              </span>
            </span>
            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                demoState.useCookieSessionHydration
                  ? 'bg-(--auth-primary) text-(--auth-primary-foreground)'
                  : 'border border-(--auth-border) bg-(--auth-surface) text-(--auth-muted-fg)'
              }`}
            >
              {demoState.useCookieSessionHydration ? 'On' : 'Off'}
            </span>
          </button>
        </div>
      </section>

      {demoState.useCustomOtpApi && (
        <section>
          <p className={`${panelSectionTitleClass} mb-3`}>OTP Endpoints</p>
          <div className="space-y-3">
            <div className="flex flex-col gap-1 text-sm text-(--auth-fg)">
              <label htmlFor="otpApiUrl">OTP API URL</label>
              <input
                id="otpApiUrl"
                type="url"
                value={demoState.otpApiUrl}
                onChange={(e) =>
                  setDemoState((prev) => ({
                    ...prev,
                    otpApiUrl: e.target.value,
                  }))
                }
                placeholder={demoEnvDefaults.otpApiUrl || 'https://your-api.example.com'}
                className={panelInputClass}
              />
            </div>
            <div className="flex flex-col gap-1 text-sm text-(--auth-fg)">
              <label htmlFor="otpVerifyApiUrl">OTP Verify API URL</label>
              <input
                id="otpVerifyApiUrl"
                type="url"
                value={demoState.otpVerifyApiUrl}
                onChange={(e) =>
                  setDemoState((prev) => ({
                    ...prev,
                    otpVerifyApiUrl: e.target.value,
                  }))
                }
                placeholder={
                  demoEnvDefaults.otpVerifyApiUrl ||
                  'https://your-api.example.com/verify (optional)'
                }
                className={panelInputClass}
              />
            </div>
            <p className="text-xs leading-5 text-(--auth-muted-fg)">
              Requests use the OTP API URL. Verification falls back to that URL if the verify
              endpoint is empty.
            </p>
          </div>
        </section>
      )}

      {demoState.useCookieSessionHydration && (
        <section>
          <p className={`${panelSectionTitleClass} mb-3`}>Session Endpoint</p>
          <div className="space-y-3">
            <div className="flex flex-col gap-1 text-sm text-(--auth-fg)">
              <label htmlFor="currentUserApiUrl">Current User API URL</label>
              <input
                id="currentUserApiUrl"
                type="url"
                value={demoState.currentUserApiUrl}
                onChange={(e) =>
                  setDemoState((prev) => ({
                    ...prev,
                    currentUserApiUrl: e.target.value,
                  }))
                }
                placeholder={demoEnvDefaults.currentUserApiUrl || 'https://your-api.example.com/me'}
                className={panelInputClass}
              />
            </div>
            <div className="flex flex-col gap-1 text-sm text-(--auth-fg)">
              <label htmlFor="logoutApiUrl">Logout API URL</label>
              <input
                id="logoutApiUrl"
                type="url"
                value={demoState.logoutApiUrl}
                onChange={(e) =>
                  setDemoState((prev) => ({
                    ...prev,
                    logoutApiUrl: e.target.value,
                  }))
                }
                placeholder={
                  demoEnvDefaults.logoutApiUrl ||
                  demoEnvDefaults.currentUserApiUrl ||
                  'https://your-api.example.com/logout (optional)'
                }
                className={panelInputClass}
              />
            </div>
            <p className="text-xs leading-5 text-(--auth-muted-fg)">
              The demo calls the current user endpoint with credentials included to hydrate{' '}
              <span className="font-mono">useAuth().user</span> in cookie-based flows. Logout uses
              the logout endpoint when provided, otherwise it falls back to current user URL.
            </p>
          </div>
        </section>
      )}
    </>
  )
}
