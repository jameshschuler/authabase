import { useEffect, useState } from 'react'
import { useAuth } from '../provider'
import type { AuthUser, OTPFormProps, UseOTPFlowReturn } from '../types'

/**
 * Headless hook for OTP authentication flow.
 * Use this when you want full control over the OTP UI.
 */
export function useOTPFlow({
  onSuccess,
  onError,
  onSubmitStart,
  onSubmitComplete,
  onValidationError,
  mapError,
  phoneNumber,
  defaultMethod = 'email',
  enabledMethods,
  resendCountdownSeconds = 60,
  otpLength = 6,
}: Pick<
  OTPFormProps,
  | 'onSuccess'
  | 'onError'
  | 'onSubmitStart'
  | 'onSubmitComplete'
  | 'onValidationError'
  | 'mapError'
  | 'phoneNumber'
  | 'defaultMethod'
  | 'enabledMethods'
  | 'resendCountdownSeconds'
  | 'otpLength'
> = {}): UseOTPFlowReturn {
  const { supabase } = useAuth()
  const [step, setStep] = useState<'contact' | 'otp'>('contact')
  const [deliveryMethod, setDeliveryMethod] = useState<'email' | 'phone'>(defaultMethod ?? 'email')
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
        const msg = 'Enter a valid phone number in E.164 format'
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
        deliveryMethod === 'email'
          ? 'Check your email for the OTP code'
          : 'Check your phone for the OTP code'
      )
      setStep('otp')
      setResendCountdown(resendCountdownSeconds ?? 60)

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

    const length = otpLength ?? 6
    if (!otp || otp.length !== length) {
      const msg = `OTP must be ${length} digits`
      setGeneralError(msg)
      onValidationError?.({ otp: msg })
      return
    }

    onSubmitStart?.()
    setIsLoading(true)
    try {
      const { data, error } =
        deliveryMethod === 'email'
          ? await supabase.auth.verifyOtp({ email, token: otp, type: 'email' })
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

  return {
    step,
    deliveryMethod,
    email,
    phone,
    otp,
    isLoading,
    generalError,
    successMessage,
    resendCountdown,
    setDeliveryMethod,
    setEmail,
    setPhone,
    setOtp,
    handleSendOTP,
    handleVerifyOTP,
    goBack: () => setStep('contact'),
  }
}
