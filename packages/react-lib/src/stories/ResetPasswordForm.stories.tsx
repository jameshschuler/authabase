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
    minPasswordLength: { control: { type: 'number', min: 6, max: 32 } },
  },
}

export default meta
type Story = StoryObj<typeof ResetPasswordForm>

export const Default: Story = {
  args: {
    minPasswordLength: 8,
  },
  render: (args) => (
    <AuthContainer title="Reset your password" subtitle="Choose a strong new password">
      <ResetPasswordForm {...args} />
    </AuthContainer>
  ),
}

export const LoggedIn: Story = {
  args: {
    minPasswordLength: 8,
  },
  parameters: {
    authContext: {
      user: { id: 'mock-user-id', email: 'user@example.com' },
    },
  },
  render: (args) => (
    <AuthContainer title="Reset your password" subtitle="Choose a strong new password">
      <ResetPasswordForm {...args} />
    </AuthContainer>
  ),
}
