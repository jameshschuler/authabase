import type { Meta, StoryObj } from '@storybook/react'
import { AuthContainer } from '../components/containers/AuthContainer'
import { ForgotPasswordForm } from '../components/auth/ForgotPasswordForm'

const meta: Meta<typeof ForgotPasswordForm> = {
  title: 'Auth/ForgotPasswordForm',
  component: ForgotPasswordForm,
  tags: ['autodocs'],
  argTypes: {
    onSuccess: { action: 'onSuccess' },
    onError: { action: 'onError' },
    redirectTo: { control: 'text' },
  },
}

export default meta
type Story = StoryObj<typeof ForgotPasswordForm>

export const Default: Story = {
  args: {},
  render: (args) => (
    <AuthContainer
      title="Forgot your password?"
      subtitle="Enter your email and we'll send a reset link"
    >
      <ForgotPasswordForm {...args} />
    </AuthContainer>
  ),
}
