import { useMemo } from 'react'
import {
  type ConfigPreset,
  defaultDemoCopy,
  defaultEnabledMethods,
  defaultOtpMethods,
  panelSectionTitleClass,
} from '../../shared/demo-config'
import { type DemoControlsStateProps } from './types'

export function PresetsSection({ demoState, setDemoState }: DemoControlsStateProps) {
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
          otpMethods: { ...defaultOtpMethods },
          minPasswordLength: defaultDemoCopy.minPasswordLength,
          passwordMismatchText: defaultDemoCopy.passwordMismatchText,
          otpHintText: defaultDemoCopy.otpHintText,
          otpSendText: defaultDemoCopy.otpSendText,
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
          otpMethods: { ...defaultOtpMethods },
          minPasswordLength: defaultDemoCopy.minPasswordLength,
          passwordMismatchText: defaultDemoCopy.passwordMismatchText,
          otpHintText: defaultDemoCopy.otpHintText,
          otpSendText: defaultDemoCopy.otpSendText,
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
          otpMethods: { ...defaultOtpMethods },
          minPasswordLength: defaultDemoCopy.minPasswordLength,
          passwordMismatchText: defaultDemoCopy.passwordMismatchText,
          otpHintText: defaultDemoCopy.otpHintText,
          otpSendText: defaultDemoCopy.otpSendText,
        }
      }

      return {
        ...prev,
        enabledMethods: { ...defaultEnabledMethods },
        showSignupLink: true,
        showLoginLink: true,
        otpMethods: { ...defaultOtpMethods },
        minPasswordLength: defaultDemoCopy.minPasswordLength,
        passwordMismatchText: defaultDemoCopy.passwordMismatchText,
        otpHintText: defaultDemoCopy.otpHintText,
        otpSendText: defaultDemoCopy.otpSendText,
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
        ? 'border-(--auth-primary) bg-(--auth-primary) text-(--auth-primary-foreground)'
        : 'border-(--auth-border) bg-(--auth-surface) text-(--auth-fg) hover:bg-[color-mix(in_srgb,var(--auth-surface)_80%,var(--auth-border))]'
    }`

  return (
    <div className="mb-6">
      <p className={`${panelSectionTitleClass} mb-3`}>Presets</p>
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-2">
        <button
          type="button"
          className={presetButtonClass('all')}
          onClick={() => applyPreset('all')}
        >
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
    </div>
  )
}
