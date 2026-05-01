import { useEffect, useRef, useState } from 'react'
import { Button } from '../ui/Button'
import { EmailInput } from '../inputs/EmailInput'
import { Input } from '../ui/Input'
import { Label } from '../ui/Label'
import { useAuth } from '../../provider'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock } from '@fortawesome/free-solid-svg-icons'
import type { OTPFormProps, AuthUser } from '../../types'

const DEFAULT_COPY = {
  emailLabel: 'Email',
  emailPlaceholder: 'Enter your email',
  phoneLabel: 'Phone number',
  phonePlaceholder: '+14155552671',
  phoneHint: 'Use E.164 format, for example +14155552671',
  sendOtpButton: 'Send OTP',
  sendingOtpButton: (method: string) => `Sending OTP to ${method}...`,
  verifyButton: 'Verify OTP',
  verifyingButton: 'Verifying...',
  resendButton: 'Resend OTP',
  resendCountdownText: (s: number) => `Resend in ${s}s`,
  otpLabel: 'Enter OTP Code',
  otpPlaceholder: '000000',
  otpSubtext: (contact: string) => `A code has been sent to ${contact}`,
  emailSuccessMessage: 'Check your email for the OTP code',
  phoneSuccessMessage: 'Check your phone for the OTP code',
  changeEmailLink: 'Change email',
  changePhoneLink: 'Change phone number',
  noMethodsMessage: 'No OTP methods are enabled. Enable email or phone OTP.',
}

export function OTPForm({
  onSuccess,
  onError,
  phoneNumber,
  defaultMethod = 'email',
  enabledMethods,
  resendCountdownSeconds = 60,
  otpLength = 6,
  autoSubmitOnComplete = false,
  onSubmitStart,
  onSubmitComplete,
  onValidationError,
  mapError,
  copy: copyProp,
}: OTPFormProps) {
  const { supabase } = useAuth()
  const copy = { ...DEFAULT_COPY, ...copyProp }
  const [step, setStep] = useState<'contact' | 'otp'>('contact')
  const [deliveryMethod, setDeliveryMethod] = useState<'email' | 'phone'>(defaultMethod)
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState(phoneNumber ?? '')
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [resendCountdown, setResendCountdown] = useState(0)
  const otpInputRef = useRef<HTMLInputElement>(null)

  const normalizePhone = (value: string) => value.replace(/[\s()-]/g, '')
  const isValidPhone = (value: string) => /^\+?[1-9]\d{7,14}$/.test(normalizePhone(value))

  const isEmailEnabled = enabledMethods?.email ?? true
  const isPhoneEnabled = enabledMethods?.phone ?? true
  const availableMethods = [
    ...(isEmailEnabled ? (['email'] as const) : []),
    ...(isPhoneEnabled ? (['phone'] as const) : []),
  ]

  useEffect(() => {
    if (!availableMethods.includes(deliveryMethod)) {
      setDeliveryMethod(availableMethods[0] ?? 'email')
    }
  }, [availableMethods, deliveryMethod])

  const contactValue = deliveryMethod === 'email' ? email : phone
  const contactLabel = deliveryMethod === 'email' ? 'email' : 'phone number'

  const handleSendOTP = async () => {
    setGeneralError(null)

    if (!supabase) {
      setGeneralError('Supabase client not initialized')
      return
    }

    if (deliveryMethod === 'email') {
      if (!email) {
        const msg = 'Email is required'
        setGeneralError(msg)
        onValidationError?.({ email: msg })
        return
      }
    } else {
      if (!phone) {
        const msg = 'Phone number is required'
        setGeneralError(msg)
        onValidationError?.({ phone: msg })
        return
      }
      if (!isValidPhone(phone)) {
        const msg = 'Enter a valid phone number in E.164 format, for example +14155552671'
        setGeneralError(msg)
        onValidationError?.({ phone: msg })
        return
      }
    }

    onSubmitStart?.()
    setIsLoading(true)
    try {
      const { error } =
        deliveryMethod === 'email'
          ? await supabase.auth.signInWithOtp({ email })
          : await supabase.auth.signInWithOtp({ phone: normalizePhone(phone) })

      if (error) throw error

      setSuccessMessage(
        deliveryMethod === 'email' ? copy.emailSuccessMessage : copy.phoneSuccessMessage
      )
      setStep('otp')
      setResendCountdown(resendCountdownSeconds)

      const countdown = setInterval(() => {
        setResendCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdown)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      // Auto-focus OTP input after sending
      setTimeout(() => otpInputRef.current?.focus(), 50)
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error(`Failed to send OTP to ${contactLabel}`)
      const message = mapError ? mapError(err) : err.message
      setGeneralError(message)
      onError?.(err)
    } finally {
      setIsLoading(false)
      onSubmitComplete?.()
    }
  }

  const handleVerifyOTP = async () => {
    setGeneralError(null)

    if (!supabase) {
      setGeneralError('Supabase client not initialized')
      return
    }

    if (!otp || otp.length !== otpLength) {
      const msg = `OTP must be ${otpLength} digits`
      setGeneralError(msg)
      onValidationError?.({ otp: msg })
      return
    }

    onSubmitStart?.()
    setIsLoading(true)
    try {
      const { data, error } =
        deliveryMethod === 'email'
          ? await supabase.auth.verifyOtp({
              email,
              token: otp,
              type: 'email',
            })
          : await supabase.auth.verifyOtp({
              phone: normalizePhone(phone),
              token: otp,
              type: 'sms',
            })

      if (error) throw error

      const user: AuthUser = {
        id: data.user?.id || '',
        email: data.user?.email,
        phone: data.user?.phone,
        user_metadata: data.user?.user_metadata,
      }
      onSuccess?.(user)
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to verify OTP')
      const message = mapError ? mapError(err) : err.message
      setGeneralError(message)
      onError?.(err)
    } finally {
      setIsLoading(false)
      onSubmitComplete?.()
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (step === 'contact') {
          void handleSendOTP()
        } else {
          void handleVerifyOTP()
        }
      }}
      className="space-y-6"
      noValidate
    >
      {generalError && (
        <div
          role="alert"
          aria-live="polite"
          className="rounded-md bg-destructive/10 p-3 text-sm text-destructive"
        >
          {generalError}
        </div>
      )}

      {availableMethods.length === 0 && (
        <div role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {copy.noMethodsMessage}
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-md bg-green-50 p-3 text-sm text-green-800"
        >
          {successMessage}
        </div>
      )}

      {step === 'contact' ? (
        <>
          {availableMethods.length > 1 && (
            <div
              className="grid grid-cols-2 gap-2 rounded-md border border-border p-1"
              role="tablist"
            >
              {isEmailEnabled && (
                <button
                  type="button"
                  role="tab"
                  aria-selected={deliveryMethod === 'email'}
                  onClick={() => setDeliveryMethod('email')}
                  className={`rounded px-3 py-1.5 text-sm font-medium ${
                    deliveryMethod === 'email'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  disabled={isLoading}
                >
                  Email
                </button>
              )}
              {isPhoneEnabled && (
                <button
                  type="button"
                  role="tab"
                  aria-selected={deliveryMethod === 'phone'}
                  onClick={() => setDeliveryMethod('phone')}
                  className={`rounded px-3 py-1.5 text-sm font-medium ${
                    deliveryMethod === 'phone'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  disabled={isLoading}
                >
                  Phone
                </button>
              )}
            </div>
          )}

          {deliveryMethod === 'email' ? (
            <EmailInput
              id="email"
              placeholder={copy.emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              label={copy.emailLabel}
              disabled={isLoading}
              required
            />
          ) : (
            <div className="space-y-2">
              <Label htmlFor="phone">{copy.phoneLabel}</Label>
              <Input
                id="phone"
                type="tel"
                placeholder={copy.phonePlaceholder}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={isLoading}
                required
              />
              <p className="text-xs text-muted-foreground">{copy.phoneHint}</p>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading} aria-busy={isLoading}>
            {isLoading
              ? copy.sendingOtpButton(deliveryMethod === 'email' ? 'email' : 'phone')
              : copy.sendOtpButton}
          </Button>
        </>
      ) : (
        <>
          <div className="space-y-2">
            <Label htmlFor="otp">{copy.otpLabel}</Label>
            <Input
              ref={otpInputRef}
              id="otp"
              placeholder={copy.otpPlaceholder}
              value={otp}
              onChange={(e) => {
                const next = e.target.value.replace(/\D/g, '').slice(0, otpLength)
                setOtp(next)
                if (autoSubmitOnComplete && next.length === otpLength) {
                  void handleVerifyOTP()
                }
              }}
              maxLength={otpLength}
              disabled={isLoading}
              className="text-center text-2xl tracking-widest"
              required
              aria-label={copy.otpLabel}
              inputMode="numeric"
              autoComplete="one-time-code"
            />
            <p className="text-sm text-muted-foreground">{copy.otpSubtext(contactValue)}</p>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading} aria-busy={isLoading}>
            {isLoading ? copy.verifyingButton : copy.verifyButton}
          </Button>

          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={() => setStep('contact')}
              className="text-primary hover:underline"
              disabled={isLoading}
            >
              {deliveryMethod === 'email' ? copy.changeEmailLink : copy.changePhoneLink}
            </button>
            <button
              type="button"
              onClick={() => {
                void handleSendOTP()
              }}
              disabled={isLoading || resendCountdown > 0}
              className="text-primary hover:underline disabled:text-muted-foreground disabled:cursor-not-allowed"
            >
              {resendCountdown > 0 ? (
                <span className="flex items-center gap-1">
                  <FontAwesomeIcon icon={faClock} className="text-xs" />
                  {copy.resendCountdownText(resendCountdown)}
                </span>
              ) : (
                copy.resendButton
              )}
            </button>
          </div>
        </>
      )}
    </form>
  )
}

OTPForm.displayName = 'OTPForm'
