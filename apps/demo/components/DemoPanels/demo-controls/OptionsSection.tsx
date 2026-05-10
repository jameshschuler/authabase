import {
  createDefaultDemoState,
  type EnabledMethods,
  panelInputClass,
  panelSectionTitleClass,
} from '../../shared/demo-config'
import { ToggleField } from '../ToggleField'
import { type DemoControlsStateProps } from './types'

export function OptionsSection({ demoState, setDemoState }: DemoControlsStateProps) {
  const setEnabledMethod = (method: keyof EnabledMethods, enabled: boolean) => {
    setDemoState((prev) => ({
      ...prev,
      enabledMethods: {
        ...prev.enabledMethods,
        [method]: enabled,
      },
    }))
  }

  return (
    <>
      <section>
        <p className={`${panelSectionTitleClass} mb-3`}>Enabled Methods</p>
        <div className="space-y-2">
          <ToggleField
            checked={Boolean(demoState.enabledMethods.email)}
            onChange={(checked) => setEnabledMethod('email', checked)}
            label="Email and password"
          />
          <ToggleField
            checked={Boolean(demoState.enabledMethods.google)}
            onChange={(checked) => setEnabledMethod('google', checked)}
            label="Google OAuth"
          />
          <ToggleField
            checked={Boolean(demoState.enabledMethods.github)}
            onChange={(checked) => setEnabledMethod('github', checked)}
            label="GitHub OAuth"
          />
          <ToggleField
            checked={Boolean(demoState.enabledMethods.otp)}
            onChange={(checked) => setEnabledMethod('otp', checked)}
            label="One-time password"
          />
        </div>
      </section>

      <section>
        <p className={`${panelSectionTitleClass} mb-3`}>OTP Options</p>
        <div className="space-y-2">
          <ToggleField
            checked={demoState.otpMethods.email}
            onChange={(checked) =>
              setDemoState((prev) => ({
                ...prev,
                otpMethods: {
                  ...prev.otpMethods,
                  email: checked,
                },
              }))
            }
            label="Allow email OTP"
          />
          <ToggleField
            checked={demoState.otpMethods.phone}
            onChange={(checked) =>
              setDemoState((prev) => ({
                ...prev,
                otpMethods: {
                  ...prev.otpMethods,
                  phone: checked,
                },
              }))
            }
            label="Allow phone OTP"
          />
        </div>
      </section>

      <section>
        <p className={`${panelSectionTitleClass} mb-3`}>Links</p>
        <div className="space-y-2">
          <ToggleField
            checked={demoState.showSignupLink}
            onChange={(checked) =>
              setDemoState((prev) => ({
                ...prev,
                showSignupLink: checked,
              }))
            }
            label="Show sign up link"
          />
          <ToggleField
            checked={demoState.showLoginLink}
            onChange={(checked) =>
              setDemoState((prev) => ({
                ...prev,
                showLoginLink: checked,
              }))
            }
            label="Show login link"
          />
        </div>
      </section>

      <section>
        <p className={`${panelSectionTitleClass} mb-3`}>Copy And Validation</p>
        <div className="space-y-4">
          <div className="flex flex-col gap-2 text-sm text-(--auth-fg)">
            <label htmlFor="minPasswordLength">Min Password Length</label>
            <div className="flex items-center gap-3">
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
                className="w-full accent-(--auth-primary)"
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
                className="w-16 rounded border border-(--auth-border) bg-(--auth-surface) px-2 py-1 text-xs text-(--auth-fg)"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1 text-sm text-(--auth-fg)">
            <label htmlFor="passwordMismatchText">Password Mismatch Text</label>
            <input
              id="passwordMismatchText"
              type="text"
              value={demoState.passwordMismatchText}
              onChange={(e) =>
                setDemoState((prev) => ({
                  ...prev,
                  passwordMismatchText: e.target.value,
                }))
              }
              className={panelInputClass}
            />
          </div>

          <div className="flex flex-col gap-1 text-sm text-(--auth-fg)">
            <label htmlFor="otpHintText">OTP Hint Text</label>
            <input
              id="otpHintText"
              type="text"
              value={demoState.otpHintText}
              onChange={(e) =>
                setDemoState((prev) => ({
                  ...prev,
                  otpHintText: e.target.value,
                }))
              }
              className={panelInputClass}
            />
          </div>

          <div className="flex flex-col gap-1 text-sm text-(--auth-fg)">
            <label htmlFor="otpSendText">OTP Button Text</label>
            <input
              id="otpSendText"
              type="text"
              value={demoState.otpSendText}
              onChange={(e) =>
                setDemoState((prev) => ({
                  ...prev,
                  otpSendText: e.target.value,
                }))
              }
              className={panelInputClass}
            />
          </div>
        </div>
      </section>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          className="rounded border border-(--auth-border) bg-(--auth-surface) px-3 py-1.5 text-xs font-medium text-(--auth-fg) transition-colors hover:bg-[color-mix(in_srgb,var(--auth-surface)_80%,var(--auth-border))]"
          onClick={() => setDemoState(createDefaultDemoState())}
        >
          Reset Defaults
        </button>
      </div>
    </>
  )
}
