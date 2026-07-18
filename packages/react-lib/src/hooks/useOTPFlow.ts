import { useEffect, useState } from 'react'
import { useAuth } from '../provider'
import type { AuthUser, OTPFormProps, UseOTPFlowReturn } from '../types'

/**
 * Headless hook for OTP authentication flow.
 * Use this when you want full control over the OTP UI.
 */
export function useOTPFlow({
  events,
  options,
  strategy,
}: Pick<OTPFormProps, 'events' | 'options' | 'strategy'> = {}): UseOTPFlowReturn {
  const { supabase, refreshSession } = useAuth()
  const onSuccess = events?.onSuccess
  const onVerified = events?.onVerified
  const onError = events?.onError
  const onSubmitStart = events?.onSubmitStart
  const onSubmitComplete = events?.onSubmitComplete
  const onValidationError = events?.onValidationError
  const mapError = events?.mapError

  const phoneNumber = options?.phoneNumber
  const defaultMethod = options?.defaultMethod ?? 'email'
  const enabledMethods = options?.enabledMethods
  const resendCountdownSeconds = options?.resendCountdownSeconds ?? 60
  const otpLength = options?.otpLength ?? 6
  const isEmailEnabled = enabledMethods?.email ?? true
  const isPhoneEnabled = enabledMethods?.phone ?? true
  const availableMethods = [
    ...(isEmailEnabled ? (['email'] as const) : []),
    ...(isPhoneEnabled ? (['phone'] as const) : []),
  ]
  const resolveDeliveryMethod = (preferred: 'email' | 'phone') =>
    availableMethods.includes(preferred) ? preferred : (availableMethods[0] ?? 'email')

  const customStrategy = strategy?.mode === 'custom' ? strategy : null
  const [step, setStep] = useState<'contact' | 'otp'>('contact')
  const [deliveryMethod, setDeliveryMethod] = useState<'email' | 'phone'>(() =>
    resolveDeliveryMethod(defaultMethod)
  )
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState(phoneNumber ?? '')
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [resendCountdown, setResendCountdown] = useState(0)

  const normalizePhone = (value: string) => value.replace(/[\s()-]/g, '')
  const isValidPhone = (value: string) => /^\+?[1-9]\d{7,14}$/.test(normalizePhone(value))
  const normalizeMethodError = (message: string) => {
    if (deliveryMethod === 'phone' && /email is required/i.test(message)) {
      return 'Phone number is required'
    }
    if (deliveryMethod === 'email' && /phone number is required/i.test(message)) {
      return 'Email is required'
    }
    return message
  }

  useEffect(() => {
    const nextMethod = resolveDeliveryMethod(deliveryMethod)
    if (nextMethod !== deliveryMethod) {
      setDeliveryMethod(nextMethod)
    }
  }, [availableMethods, deliveryMethod])

  useEffect(() => {
    setGeneralError(null)
  }, [deliveryMethod])

  const contactLabel = deliveryMethod === 'email' ? 'email' : 'phone number'

  const handleSendOTP = async () => {
    setGeneralError(null)

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
      if (customStrategy) {
        await customStrategy.requestOTP({
          method: deliveryMethod,
          email: deliveryMethod === 'email' ? email : undefined,
          phone: deliveryMethod === 'phone' ? normalizePhone(phone) : undefined,
        })
      } else {
        if (!supabase) {
          throw new Error('Supabase client not initialized')
        }

        const { error } =
          deliveryMethod === 'email'
            ? await supabase.auth.signInWithOtp({ email })
            : await supabase.auth.signInWithOtp({ phone: normalizePhone(phone) })

        if (error) throw error
      }

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
      const message = normalizeMethodError(mapError ? mapError(err) : err.message)
      setGeneralError(message)
      onError?.(err)
    } finally {
      setIsLoading(false)
      onSubmitComplete?.()
    }
  }

  const handleVerifyOTP = async () => {
    setGeneralError(null)

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
      const verifiedPayload = {
        method: deliveryMethod,
        email: deliveryMethod === 'email' ? email : undefined,
        phone: deliveryMethod === 'phone' ? normalizePhone(phone) : undefined,
      } as const

      if (customStrategy) {
        const user = await customStrategy.verifyOTP({
          method: verifiedPayload.method,
          email: verifiedPayload.email,
          phone: verifiedPayload.phone,
          token: otp,
        })
        await refreshSession?.()
        if (user) {
          onSuccess?.(user)
        }
        onVerified?.(verifiedPayload)
      } else {
        if (!supabase) {
          throw new Error('Supabase client not initialized')
        }

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
        onVerified?.(verifiedPayload)
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to verify OTP')
      const message = normalizeMethodError(mapError ? mapError(err) : err.message)
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
