import { useEffect, useState } from 'react'
import { Button } from '../ui/Button'
import { EmailInput } from '../inputs/EmailInput'
import { Input } from '../ui/Input'
import { Label } from '../ui/Label'
import { useAuth } from '../../provider'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock } from '@fortawesome/free-solid-svg-icons'
import type { OTPFormProps, AuthUser } from '../../types'

export function OTPForm({
  onSuccess,
  onError,
  phoneNumber,
  defaultMethod = 'email',
  enabledMethods,
}: OTPFormProps) {
  const { supabase } = useAuth()
  const [step, setStep] = useState<'contact' | 'otp'>('contact')
  const [deliveryMethod, setDeliveryMethod] = useState<'email' | 'phone'>(defaultMethod)
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState(phoneNumber ?? '')
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [resendCountdown, setResendCountdown] = useState(0)

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

  const contactLabel = deliveryMethod === 'email' ? 'email' : 'phone number'
  const contactValue = deliveryMethod === 'email' ? email : phone

  const handleSendOTP = async () => {
    setGeneralError(null)

    if (!supabase) {
      setGeneralError('Supabase client not initialized')
      return
    }

    if (deliveryMethod === 'email') {
      if (!email) {
        setGeneralError('Email is required')
        return
      }
    } else {
      if (!phone) {
        setGeneralError('Phone number is required')
        return
      }
      if (!isValidPhone(phone)) {
        setGeneralError('Enter a valid phone number in E.164 format, for example +14155552671')
        return
      }
    }

    setIsLoading(true)
    try {
      const { error } =
        deliveryMethod === 'email'
          ? await supabase.auth.signInWithOtp({ email })
          : await supabase.auth.signInWithOtp({ phone: normalizePhone(phone) })

      if (error) throw error

      setSuccessMessage(
        deliveryMethod === 'email'
          ? 'Check your email for the OTP code'
          : 'Check your phone for the OTP code'
      )
      setStep('otp')
      setResendCountdown(60)

      const countdown = setInterval(() => {
        setResendCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdown)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error(`Failed to send OTP to ${contactLabel}`)
      setGeneralError(err.message)
      onError?.(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    setGeneralError(null)

    if (!supabase) {
      setGeneralError('Supabase client not initialized')
      return
    }

    if (!otp || otp.length !== 6) {
      setGeneralError('OTP must be 6 digits')
      return
    }

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
      setGeneralError(err.message)
      onError?.(err)
    } finally {
      setIsLoading(false)
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
    >
      {generalError && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {generalError}
        </div>
      )}

      {availableMethods.length === 0 && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          No OTP methods are enabled. Enable email or phone OTP.
        </div>
      )}

      {successMessage && (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">{successMessage}</div>
      )}

      {step === 'contact' ? (
        <>
          {availableMethods.length > 1 && (
            <div className="grid grid-cols-2 gap-2 rounded-md border border-border p-1">
              {isEmailEnabled && (
                <button
                  type="button"
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
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              label="Email"
              disabled={isLoading}
              required
            />
          ) : (
            <div className="space-y-2">
              <Label htmlFor="phone">Phone number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+14155552671"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={isLoading}
                required
              />
              <p className="text-xs text-muted-foreground">
                Use E.164 format, for example +14155552671
              </p>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading
              ? `Sending OTP to ${deliveryMethod === 'email' ? 'email' : 'phone'}...`
              : 'Send OTP'}
          </Button>
        </>
      ) : (
        <>
          <div className="space-y-2">
            <Label htmlFor="otp">Enter OTP Code</Label>
            <Input
              id="otp"
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              disabled={isLoading}
              className="text-center text-2xl tracking-widest"
              required
            />
            <p className="text-sm text-muted-foreground">
              A 6-digit code has been sent to <strong>{contactValue}</strong>
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Verifying...' : 'Verify OTP'}
          </Button>

          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={() => setStep('contact')}
              className="text-primary hover:underline"
              disabled={isLoading}
            >
              Change {deliveryMethod === 'email' ? 'email' : 'phone number'}
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
                  Resend in {resendCountdown}s
                </span>
              ) : (
                'Resend OTP'
              )}
            </button>
          </div>
        </>
      )}
    </form>
  )
}

OTPForm.displayName = 'OTPForm'
