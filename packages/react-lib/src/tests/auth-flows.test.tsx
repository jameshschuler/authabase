import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useAuth } from '../provider'
import { MagicLinkForm } from '../components/auth/MagicLinkForm'
import { ForgotPasswordForm } from '../components/auth/ForgotPasswordForm'
import { ResetPasswordForm } from '../components/auth/ResetPasswordForm'
import { OTPForm } from '../components/auth/OTPForm'

vi.mock('../provider', () => ({
  useAuth: vi.fn(),
}))

type SupabaseAuthMock = {
  signInWithOtp: ReturnType<typeof vi.fn>
  verifyOtp: ReturnType<typeof vi.fn>
  resetPasswordForEmail: ReturnType<typeof vi.fn>
  updateUser: ReturnType<typeof vi.fn>
}

const mockedUseAuth = vi.mocked(useAuth)
let authMock: SupabaseAuthMock
let refreshSessionMock: ReturnType<typeof vi.fn>

function createSupabaseAuthMock(): SupabaseAuthMock {
  return {
    signInWithOtp: vi.fn().mockResolvedValue({ error: null }),
    verifyOtp: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    resetPasswordForEmail: vi.fn().mockResolvedValue({ error: null }),
    updateUser: vi.fn().mockResolvedValue({
      data: {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          phone: null,
          user_metadata: {},
        },
      },
      error: null,
    }),
  }
}

beforeEach(() => {
  authMock = createSupabaseAuthMock()
  refreshSessionMock = vi.fn().mockResolvedValue(undefined)
  mockedUseAuth.mockReturnValue({
    user: null,
    isLoading: false,
    error: null,
    enabledMethods: {
      email: true,
      google: true,
      github: true,
      otp: true,
    },
    signOut: vi.fn(),
    refreshSession: refreshSessionMock,
    supabase: {
      auth: authMock,
    } as any,
  })
})

describe('Auth Flows', () => {
  it('sends a magic link with redirect URL', async () => {
    const user = userEvent.setup()
    render(<MagicLinkForm redirectTo="https://example.com/welcome" />)

    await user.type(screen.getByLabelText('Email'), 'magic@example.com')
    await user.click(screen.getByRole('button', { name: 'Send Magic Link' }))

    await waitFor(() => {
      expect(authMock.signInWithOtp).toHaveBeenCalledWith({
        email: 'magic@example.com',
        options: {
          emailRedirectTo: 'https://example.com/welcome',
        },
      })
    })

    expect(screen.getByText('Magic link sent. Check your email to continue.')).toBeInTheDocument()
  })

  it('sends a password reset link', async () => {
    const user = userEvent.setup()
    render(<ForgotPasswordForm redirectTo="https://example.com/reset" />)

    await user.type(screen.getByLabelText('Email'), 'reset@example.com')
    await user.click(screen.getByRole('button', { name: 'Send Reset Link' }))

    await waitFor(() => {
      expect(authMock.resetPasswordForEmail).toHaveBeenCalledWith('reset@example.com', {
        redirectTo: 'https://example.com/reset',
      })
    })

    expect(screen.getByText('Reset link sent. Check your email to continue.')).toBeInTheDocument()
  })

  it('validates password mismatch before calling reset API', async () => {
    const user = userEvent.setup()
    render(<ResetPasswordForm />)

    await user.type(screen.getByLabelText('New Password'), 'ValidPass123')
    await user.type(screen.getByLabelText('Confirm Password'), 'ValidPass321')
    await user.click(screen.getByRole('button', { name: 'Update Password' }))

    expect(screen.getByText('Passwords do not match')).toBeInTheDocument()

    expect(authMock.updateUser).not.toHaveBeenCalled()
  })

  it('updates password successfully', async () => {
    const user = userEvent.setup()
    const onSuccess = vi.fn()

    render(<ResetPasswordForm onSuccess={onSuccess} />)

    await user.type(screen.getByLabelText('New Password'), 'ValidPass123')
    await user.type(screen.getByLabelText('Confirm Password'), 'ValidPass123')
    await user.click(screen.getByRole('button', { name: 'Update Password' }))

    await waitFor(() => {
      expect(authMock.updateUser).toHaveBeenCalledWith({ password: 'ValidPass123' })
    })

    expect(onSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'user-123',
        email: 'test@example.com',
      })
    )
  })

  it('supports classic single OTP input mode', async () => {
    const user = userEvent.setup()
    const onRequestOTP = vi.fn().mockResolvedValue(undefined)
    const onVerifyOTP = vi.fn().mockResolvedValue({
      id: 'otp-user',
      email: 'otp@example.com',
    })

    render(
      <OTPForm
        options={{ otpInputMode: 'single' }}
        strategy={{
          mode: 'custom',
          requestOTP: onRequestOTP,
          verifyOTP: onVerifyOTP,
        }}
      />
    )

    await user.type(screen.getByLabelText('Email'), 'otp@example.com')
    await user.click(screen.getByRole('button', { name: 'Send OTP' }))

    await waitFor(() => {
      expect(onRequestOTP).toHaveBeenCalledWith({
        method: 'email',
        email: 'otp@example.com',
        phone: undefined,
      })
    })

    await user.type(screen.getByRole('textbox', { name: 'Enter OTP Code' }), '123456')
    await user.click(screen.getByRole('button', { name: 'Verify OTP' }))

    await waitFor(() => {
      expect(onVerifyOTP).toHaveBeenCalledWith({
        method: 'email',
        email: 'otp@example.com',
        phone: undefined,
        token: '123456',
      })
    })
  })

  it('calls onVerified when custom OTP verify returns no user', async () => {
    const user = userEvent.setup()
    const onRequestOTP = vi.fn().mockResolvedValue(undefined)
    const onVerifyOTP = vi.fn().mockResolvedValue(undefined)
    const onVerified = vi.fn()
    const onSuccess = vi.fn()

    render(
      <OTPForm
        options={{ otpInputMode: 'single' }}
        strategy={{
          mode: 'custom',
          requestOTP: onRequestOTP,
          verifyOTP: onVerifyOTP,
        }}
        events={{ onVerified, onSuccess }}
      />
    )

    await user.type(screen.getByLabelText('Email'), 'otp@example.com')
    await user.click(screen.getByRole('button', { name: 'Send OTP' }))

    await waitFor(() => {
      expect(onRequestOTP).toHaveBeenCalledWith({
        method: 'email',
        email: 'otp@example.com',
        phone: undefined,
      })
    })

    await user.type(screen.getByRole('textbox', { name: 'Enter OTP Code' }), '123456')
    await user.click(screen.getByRole('button', { name: 'Verify OTP' }))

    await waitFor(() => {
      expect(onVerifyOTP).toHaveBeenCalledWith({
        method: 'email',
        email: 'otp@example.com',
        phone: undefined,
        token: '123456',
      })
      expect(onVerified).toHaveBeenCalledWith({
        method: 'email',
        email: 'otp@example.com',
        phone: undefined,
      })
      expect(refreshSessionMock).toHaveBeenCalledTimes(1)
    })

    expect(onSuccess).not.toHaveBeenCalled()
  })
})
