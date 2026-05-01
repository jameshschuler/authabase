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
    onSubmitStart: { action: 'onSubmitStart' },
    onSubmitComplete: { action: 'onSubmitComplete' },
    onValidationError: { action: 'onValidationError' },
    redirectTo: { control: 'text' },
  },
}

export default meta
type Story = StoryObj<typeof ForgotPasswordForm>

const wrap = (story: React.ReactNode) => (
  <AuthContainer
    title="Forgot your password?"
    subtitle="Enter your email and we'll send a reset link"
  >
    {story}
  </AuthContainer>
)

export const Default: Story = {
  args: {},
  render: (args) => wrap(<ForgotPasswordForm {...args} />),
}

export const CustomCopy: Story = {
  args: {
    copy: {
      emailLabel: 'Account Email',
      emailPlaceholder: 'you@example.com',
      submitButton: 'Email me a reset link',
      loadingButton: 'Sending...',
      successMessage: 'Done! Check your inbox for a reset link.',
    },
  },
  render: (args) => wrap(<ForgotPasswordForm {...args} />),
}

export const WithErrorMapping: Story = {
  args: {
    mapError: (err) => {
      if (err.message.includes('not found')) return 'No account found with that email address.'
      return err.message
    },
  },
  render: (args) => wrap(<ForgotPasswordForm {...args} />),
}
