import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAuth } from '../provider'
import { useLoginForm } from '../hooks/useLoginForm'
import { useSignupForm } from '../hooks/useSignupForm'
import { useOTPFlow } from '../hooks/useOTPFlow'

vi.mock('../provider', () => ({
  useAuth: vi.fn(),
}))

const mockedUseAuth = vi.mocked(useAuth)

function makeSupabase(overrides: Record<string, unknown> = {}) {
  return {
    auth: {
      signInWithPassword: vi.fn().mockResolvedValue({
        data: { user: { id: 'u1', email: 'test@example.com', user_metadata: {} } },
        error: null,
      }),
      signUp: vi.fn().mockResolvedValue({
        data: { user: { id: 'u1', email: 'test@example.com', user_metadata: {} } },
        error: null,
      }),
      signInWithOtp: vi.fn().mockResolvedValue({ error: null }),
      verifyOtp: vi.fn().mockResolvedValue({
        data: { user: { id: 'u1', email: 'test@example.com', user_metadata: {} } },
        error: null,
      }),
      ...overrides,
    },
  } as any
}

beforeEach(() => {
  mockedUseAuth.mockReturnValue({
    user: null,
    isLoading: false,
    error: null,
    enabledMethods: { email: true, google: false, github: false, otp: true },
    signOut: vi.fn(),
    refreshSession: vi.fn(),
    supabase: makeSupabase(),
  })
})

// ---------------------------------------------------------------------------
// useLoginForm
// ---------------------------------------------------------------------------
describe('useLoginForm', () => {
  it('initialises with empty form data and no errors', () => {
    const { result } = renderHook(() => useLoginForm())
    expect(result.current.formData).toEqual({ email: '', password: '' })
    expect(result.current.errors).toEqual({})
    expect(result.current.generalError).toBeNull()
    expect(result.current.isLoading).toBe(false)
  })

  it('handleInputChange updates formData', () => {
    const { result } = renderHook(() => useLoginForm())
    act(() => {
      result.current.handleInputChange({
        target: { name: 'email', value: 'a@b.com' },
      } as React.ChangeEvent<HTMLInputElement>)
    })
    expect(result.current.formData.email).toBe('a@b.com')
  })

  it('handleInputChange clears the field error when the user types', () => {
    const { result } = renderHook(() => useLoginForm())
    // First trigger a validation error by submitting empty
    const fakeEvent = { preventDefault: vi.fn() } as any
    act(() => {
      result.current.handleSubmit(fakeEvent)
    })
    // Type into email to clear its error
    act(() => {
      result.current.handleInputChange({
        target: { name: 'email', value: 'x@y.com' },
      } as React.ChangeEvent<HTMLInputElement>)
    })
    expect(result.current.errors.email).toBeUndefined()
  })

  it('sets field errors and calls onValidationError on empty submit', async () => {
    const onValidationError = vi.fn()
    const { result } = renderHook(() => useLoginForm({ onValidationError }))
    const fakeEvent = { preventDefault: vi.fn() } as any
    await act(async () => {
      await result.current.handleSubmit(fakeEvent)
    })
    expect(result.current.errors.email).toBeTruthy()
    expect(onValidationError).toHaveBeenCalledWith(
      expect.objectContaining({ email: expect.any(String) })
    )
  })

  it('sets generalError when no supabase client is present', async () => {
    mockedUseAuth.mockReturnValue({
      ...mockedUseAuth(),
      supabase: null,
    } as any)
    const { result } = renderHook(() => useLoginForm())
    const fakeEvent = { preventDefault: vi.fn() } as any
    // Provide valid form data so we pass validation
    act(() => {
      result.current.handleInputChange({
        target: { name: 'email', value: 'a@b.com' },
      } as React.ChangeEvent<HTMLInputElement>)
      result.current.handleInputChange({
        target: { name: 'password', value: 'secret' },
      } as React.ChangeEvent<HTMLInputElement>)
    })
    await act(async () => {
      await result.current.handleSubmit(fakeEvent)
    })
    expect(result.current.generalError).toBe('Supabase client not initialized')
  })

  it('calls onSuccess with user on successful sign-in', async () => {
    const onSuccess = vi.fn()
    const { result } = renderHook(() => useLoginForm({ onSuccess }))
    act(() => {
      result.current.handleInputChange({
        target: { name: 'email', value: 'a@b.com' },
      } as React.ChangeEvent<HTMLInputElement>)
      result.current.handleInputChange({
        target: { name: 'password', value: 'secret' },
      } as React.ChangeEvent<HTMLInputElement>)
    })
    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as any)
    })
    expect(onSuccess).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'u1', email: 'test@example.com' })
    )
  })

  it('calls onError and sets generalError on failed sign-in', async () => {
    const authError = new Error('Invalid login credentials')
    mockedUseAuth.mockReturnValue({
      ...mockedUseAuth(),
      supabase: makeSupabase({
        signInWithPassword: vi.fn().mockResolvedValue({ data: null, error: authError }),
      }),
    } as any)
    const onError = vi.fn()
    const { result } = renderHook(() => useLoginForm({ onError }))
    act(() => {
      result.current.handleInputChange({
        target: { name: 'email', value: 'a@b.com' },
      } as React.ChangeEvent<HTMLInputElement>)
      result.current.handleInputChange({
        target: { name: 'password', value: 'secret' },
      } as React.ChangeEvent<HTMLInputElement>)
    })
    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as any)
    })
    expect(result.current.generalError).toBe('Invalid login credentials')
    expect(onError).toHaveBeenCalledWith(authError)
  })

  it('applies mapError to the error message', async () => {
    const authError = new Error('Invalid login credentials')
    mockedUseAuth.mockReturnValue({
      ...mockedUseAuth(),
      supabase: makeSupabase({
        signInWithPassword: vi.fn().mockResolvedValue({ data: null, error: authError }),
      }),
    } as any)
    const { result } = renderHook(() =>
      useLoginForm({ mapError: () => 'Wrong email or password.' })
    )
    act(() => {
      result.current.handleInputChange({
        target: { name: 'email', value: 'a@b.com' },
      } as React.ChangeEvent<HTMLInputElement>)
      result.current.handleInputChange({
        target: { name: 'password', value: 'secret' },
      } as React.ChangeEvent<HTMLInputElement>)
    })
    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as any)
    })
    expect(result.current.generalError).toBe('Wrong email or password.')
  })

  it('calls onSubmitStart and onSubmitComplete around the request', async () => {
    const onSubmitStart = vi.fn()
    const onSubmitComplete = vi.fn()
    const { result } = renderHook(() => useLoginForm({ onSubmitStart, onSubmitComplete }))
    act(() => {
      result.current.handleInputChange({
        target: { name: 'email', value: 'a@b.com' },
      } as React.ChangeEvent<HTMLInputElement>)
      result.current.handleInputChange({
        target: { name: 'password', value: 'secret' },
      } as React.ChangeEvent<HTMLInputElement>)
    })
    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as any)
    })
    expect(onSubmitStart).toHaveBeenCalledOnce()
    expect(onSubmitComplete).toHaveBeenCalledOnce()
  })
})

// ---------------------------------------------------------------------------
// useSignupForm
// ---------------------------------------------------------------------------
describe('useSignupForm', () => {
  it('initialises with empty form data', () => {
    const { result } = renderHook(() => useSignupForm())
    expect(result.current.formData).toEqual({ email: '', password: '', confirmPassword: '' })
    expect(result.current.errors).toEqual({})
    expect(result.current.successMessage).toBeNull()
  })

  it('sets confirmPassword error when passwords do not match', () => {
    const { result } = renderHook(() => useSignupForm())
    act(() => {
      result.current.handleInputChange({
        target: { name: 'password', value: 'Abcdef1!' },
      } as React.ChangeEvent<HTMLInputElement>)
    })
    act(() => {
      result.current.handleInputChange({
        target: { name: 'confirmPassword', value: 'different' },
      } as React.ChangeEvent<HTMLInputElement>)
    })
    expect(result.current.errors.confirmPassword).toBe('Passwords do not match')
  })

  it('rejects password that fails requireSpecialChar policy', async () => {
    const onValidationError = vi.fn()
    const { result } = renderHook(() =>
      useSignupForm({ requireSpecialChar: true, onValidationError })
    )
    act(() => {
      result.current.handleInputChange({
        target: { name: 'email', value: 'a@b.com' },
      } as React.ChangeEvent<HTMLInputElement>)
    })
    act(() => {
      result.current.handleInputChange({
        target: { name: 'password', value: 'Abcdef123' }, // no special char
      } as React.ChangeEvent<HTMLInputElement>)
    })
    act(() => {
      result.current.handleInputChange({
        target: { name: 'confirmPassword', value: 'Abcdef123' },
      } as React.ChangeEvent<HTMLInputElement>)
    })
    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as any)
    })
    expect(result.current.errors.password).toMatch(/special character/i)
    expect(onValidationError).toHaveBeenCalled()
  })

  it('calls onSuccess and sets successMessage on successful sign-up', async () => {
    const onSuccess = vi.fn()
    const { result } = renderHook(() => useSignupForm({ onSuccess }))
    act(() => {
      result.current.handleInputChange({
        target: { name: 'email', value: 'a@b.com' },
      } as React.ChangeEvent<HTMLInputElement>)
    })
    act(() => {
      result.current.handleInputChange({
        target: { name: 'password', value: 'Abcdef1!' },
      } as React.ChangeEvent<HTMLInputElement>)
    })
    act(() => {
      result.current.handleInputChange({
        target: { name: 'confirmPassword', value: 'Abcdef1!' },
      } as React.ChangeEvent<HTMLInputElement>)
    })
    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as any)
    })
    expect(onSuccess).toHaveBeenCalledWith(expect.objectContaining({ id: 'u1' }))
    expect(result.current.successMessage).toBeTruthy()
  })

  it('sets generalError on failed sign-up', async () => {
    const signupError = new Error('Email already registered')
    mockedUseAuth.mockReturnValue({
      ...mockedUseAuth(),
      supabase: makeSupabase({
        signUp: vi.fn().mockResolvedValue({ data: { user: null }, error: signupError }),
      }),
    } as any)
    const { result } = renderHook(() => useSignupForm())
    act(() => {
      result.current.handleInputChange({
        target: { name: 'email', value: 'a@b.com' },
      } as React.ChangeEvent<HTMLInputElement>)
    })
    act(() => {
      result.current.handleInputChange({
        target: { name: 'password', value: 'Abcdef1!' },
      } as React.ChangeEvent<HTMLInputElement>)
    })
    act(() => {
      result.current.handleInputChange({
        target: { name: 'confirmPassword', value: 'Abcdef1!' },
      } as React.ChangeEvent<HTMLInputElement>)
    })
    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as any)
    })
    expect(result.current.generalError).toBe('Email already registered')
  })

  it('enforces minPasswordLength', async () => {
    const { result } = renderHook(() => useSignupForm({ minPasswordLength: 12 }))
    act(() => {
      result.current.handleInputChange({
        target: { name: 'email', value: 'a@b.com' },
      } as React.ChangeEvent<HTMLInputElement>)
    })
    act(() => {
      result.current.handleInputChange({
        target: { name: 'password', value: 'Short1!' }, // only 7 chars
      } as React.ChangeEvent<HTMLInputElement>)
    })
    act(() => {
      result.current.handleInputChange({
        target: { name: 'confirmPassword', value: 'Short1!' },
      } as React.ChangeEvent<HTMLInputElement>)
    })
    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as any)
    })
    expect(result.current.errors.password).toMatch(/at least 12/i)
  })
})

// ---------------------------------------------------------------------------
// useOTPFlow
// ---------------------------------------------------------------------------
describe('useOTPFlow', () => {
  it('initialises with contact step and default email method', () => {
    const { result } = renderHook(() => useOTPFlow())
    expect(result.current.step).toBe('contact')
    expect(result.current.deliveryMethod).toBe('email')
    expect(result.current.otp).toBe('')
    expect(result.current.resendCountdown).toBe(0)
  })

  it('setDeliveryMethod switches the method', () => {
    const { result } = renderHook(() => useOTPFlow())
    act(() => result.current.setDeliveryMethod('phone'))
    expect(result.current.deliveryMethod).toBe('phone')
  })

  it('handleSendOTP sets error when email is empty', async () => {
    const onValidationError = vi.fn()
    const { result } = renderHook(() => useOTPFlow({ onValidationError }))
    await act(async () => {
      await result.current.handleSendOTP()
    })
    expect(result.current.generalError).toBeTruthy()
    expect(onValidationError).toHaveBeenCalledWith(
      expect.objectContaining({ email: expect.any(String) })
    )
  })

  it('handleSendOTP transitions to otp step on success', async () => {
    const { result } = renderHook(() => useOTPFlow())
    act(() => result.current.setEmail('a@b.com'))
    await act(async () => {
      await result.current.handleSendOTP()
    })
    expect(result.current.step).toBe('otp')
    expect(result.current.resendCountdown).toBeGreaterThan(0)
  })

  it('handleSendOTP uses resendCountdownSeconds', async () => {
    const { result } = renderHook(() => useOTPFlow({ resendCountdownSeconds: 30 }))
    act(() => result.current.setEmail('a@b.com'))
    await act(async () => {
      await result.current.handleSendOTP()
    })
    expect(result.current.resendCountdown).toBe(30)
  })

  it('handleVerifyOTP sets error when otp is wrong length', async () => {
    const onValidationError = vi.fn()
    const { result } = renderHook(() => useOTPFlow({ otpLength: 6, onValidationError }))
    act(() => {
      result.current.setEmail('a@b.com')
      result.current.setOtp('123') // too short
    })
    await act(async () => {
      await result.current.handleVerifyOTP()
    })
    expect(result.current.generalError).toMatch(/6 digits/i)
    expect(onValidationError).toHaveBeenCalledWith(
      expect.objectContaining({ otp: expect.any(String) })
    )
  })

  it('handleVerifyOTP calls onSuccess on valid OTP', async () => {
    const onSuccess = vi.fn()
    const { result } = renderHook(() => useOTPFlow({ onSuccess }))
    act(() => {
      result.current.setEmail('a@b.com')
      result.current.setOtp('123456')
    })
    await act(async () => {
      await result.current.handleVerifyOTP()
    })
    expect(onSuccess).toHaveBeenCalledWith(expect.objectContaining({ id: 'u1' }))
  })

  it('handleVerifyOTP sets generalError on failed verification', async () => {
    const verifyError = new Error('Token expired')
    mockedUseAuth.mockReturnValue({
      ...mockedUseAuth(),
      supabase: makeSupabase({
        verifyOtp: vi.fn().mockResolvedValue({ data: { user: null }, error: verifyError }),
      }),
    } as any)
    const { result } = renderHook(() => useOTPFlow())
    act(() => {
      result.current.setEmail('a@b.com')
      result.current.setOtp('123456')
    })
    await act(async () => {
      await result.current.handleVerifyOTP()
    })
    expect(result.current.generalError).toBe('Token expired')
  })

  it('goBack resets to contact step', async () => {
    const { result } = renderHook(() => useOTPFlow())
    act(() => result.current.setEmail('a@b.com'))
    await act(async () => {
      await result.current.handleSendOTP()
    })
    expect(result.current.step).toBe('otp')
    act(() => result.current.goBack())
    expect(result.current.step).toBe('contact')
  })

  it('validates phone format for phone method', async () => {
    const onValidationError = vi.fn()
    const { result } = renderHook(() => useOTPFlow({ onValidationError }))
    act(() => {
      result.current.setDeliveryMethod('phone')
      result.current.setPhone('not-a-phone')
    })
    await act(async () => {
      await result.current.handleSendOTP()
    })
    expect(result.current.generalError).toMatch(/valid phone/i)
    expect(onValidationError).toHaveBeenCalledWith(
      expect.objectContaining({ phone: expect.any(String) })
    )
  })

  it('sets generalError when no supabase client is present', async () => {
    mockedUseAuth.mockReturnValue({
      ...mockedUseAuth(),
      supabase: null,
    } as any)
    const { result } = renderHook(() => useOTPFlow())
    act(() => result.current.setEmail('a@b.com'))
    await act(async () => {
      await result.current.handleSendOTP()
    })
    expect(result.current.generalError).toBe('Supabase client not initialized')
  })
})
