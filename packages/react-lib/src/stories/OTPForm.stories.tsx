import type { Meta, StoryObj } from '@storybook/react'
import { AuthContainer } from '../components/containers/AuthContainer'
import { OTPForm } from '../components/auth/OTPForm'

const meta: Meta<typeof OTPForm> = {
  title: 'Auth/OTPForm',
  component: OTPForm,
  tags: ['autodocs'],
  argTypes: {
    onSuccess: { action: 'onSuccess' },
    onError: { action: 'onError' },
    onSubmitStart: { action: 'onSubmitStart' },
    onSubmitComplete: { action: 'onSubmitComplete' },
    onValidationError: { action: 'onValidationError' },
    defaultMethod: {
      control: 'radio',
      options: ['email', 'phone'],
    },
    resendCountdownSeconds: { control: { type: 'number', min: 10, max: 120 } },
    otpLength: { control: { type: 'number', min: 4, max: 8 } },
    autoSubmitOnComplete: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof OTPForm>

const wrap = (subtitle: string, story: React.ReactNode) => (
  <AuthContainer title="One-time password" subtitle={subtitle}>
    {story}
  </AuthContainer>
)

export const EmailOTP: Story = {
  args: {
    defaultMethod: 'email',
    enabledMethods: { email: true, phone: false },
  },
  render: (args) => wrap("We'll send a code to your email", <OTPForm {...args} />),
}

export const PhoneOTP: Story = {
  args: {
    defaultMethod: 'phone',
    enabledMethods: { email: false, phone: true },
  },
  render: (args) => wrap("We'll send a code to your phone", <OTPForm {...args} />),
}

export const BothMethods: Story = {
  args: {
    defaultMethod: 'email',
    enabledMethods: { email: true, phone: true },
  },
  render: (args) => wrap('Choose how to receive your code', <OTPForm {...args} />),
}

export const QuickResend: Story = {
  args: {
    defaultMethod: 'email',
    enabledMethods: { email: true, phone: false },
    resendCountdownSeconds: 15,
  },
  render: (args) => wrap('Resend available after 15 seconds', <OTPForm {...args} />),
}

export const AutoSubmit: Story = {
  args: {
    defaultMethod: 'email',
    enabledMethods: { email: true, phone: false },
    autoSubmitOnComplete: true,
  },
  render: (args) => wrap('Verifies automatically when code is entered', <OTPForm {...args} />),
}

export const CustomCopy: Story = {
  args: {
    defaultMethod: 'email',
    enabledMethods: { email: true, phone: true },
    copy: {
      sendOtpButton: 'Get code',
      sendingOtpButton: (method) => `Sending to ${method}...`,
      verifyButton: 'Confirm code',
      verifyingButton: 'Confirming...',
      resendButton: 'Send again',
      resendCountdownText: (s) => `Wait ${s}s`,
      otpLabel: 'Verification Code',
      otpSubtext: (contact) => `Enter the code sent to ${contact}`,
      emailSuccessMessage: 'Check your inbox for the verification code',
      changeEmailLink: 'Use a different email',
    },
  },
  render: (args) => wrap('Custom text example', <OTPForm {...args} />),
}
