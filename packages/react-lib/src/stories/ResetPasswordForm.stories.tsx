import type { Meta, StoryObj } from '@storybook/react'
import { AuthContainer } from '../components/containers/AuthContainer'
import { ResetPasswordForm } from '../components/auth/ResetPasswordForm'

const meta: Meta<typeof ResetPasswordForm> = {
  title: 'Auth/ResetPasswordForm',
  component: ResetPasswordForm,
  tags: ['autodocs'],
  argTypes: {
    onSuccess: { action: 'onSuccess' },
    onError: { action: 'onError' },
    onSubmitStart: { action: 'onSubmitStart' },
    onSubmitComplete: { action: 'onSubmitComplete' },
    onValidationError: { action: 'onValidationError' },
    minPasswordLength: { control: { type: 'number', min: 6, max: 32 } },
    requireUppercase: { control: 'boolean' },
    requireLowercase: { control: 'boolean' },
    requireNumber: { control: 'boolean' },
    requireSpecialChar: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof ResetPasswordForm>

const wrap = (story: React.ReactNode) => (
  <AuthContainer title="Reset your password" subtitle="Choose a strong new password">
    {story}
  </AuthContainer>
)

export const Default: Story = {
  args: { minPasswordLength: 8 },
  render: (args) => wrap(<ResetPasswordForm {...args} />),
}

export const StrictPolicy: Story = {
  args: {
    minPasswordLength: 12,
    requireSpecialChar: true,
  },
  render: (args) => (
    <AuthContainer
      title="Reset your password"
      subtitle="Must be 12+ characters with a special character"
    >
      <ResetPasswordForm {...args} />
    </AuthContainer>
  ),
}

export const CustomCopy: Story = {
  args: {
    copy: {
      passwordLabel: 'New Passphrase',
      confirmPasswordLabel: 'Confirm Passphrase',
      confirmPasswordPlaceholder: 'Type it again',
      submitButton: 'Set New Password',
      loadingButton: 'Saving...',
      successMessage: 'Password changed! You can now sign in.',
      passwordMismatch: 'Those passphrases do not match.',
    },
  },
  render: (args) => wrap(<ResetPasswordForm {...args} />),
}

export const LoggedIn: Story = {
  args: { minPasswordLength: 8 },
  parameters: {
    authContext: {
      user: { id: 'mock-user-id', email: 'user@example.com' },
    },
  },
  render: (args) => wrap(<ResetPasswordForm {...args} />),
}
