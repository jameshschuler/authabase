import type { Meta, StoryObj } from '@storybook/react'
import { AuthContainer } from '../components/containers/AuthContainer'
import { LoginForm } from '../components/auth/LoginForm'

const meta: Meta<typeof LoginForm> = {
  title: 'Auth/LoginForm',
  component: LoginForm,
  tags: ['autodocs'],
  argTypes: {
    onSuccess: { action: 'onSuccess' },
    onError: { action: 'onError' },
    showSignupLink: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof LoginForm>

export const Default: Story = {
  args: {
    showSignupLink: false,
  },
  render: (args) => (
    <AuthContainer title="Welcome back" subtitle="Sign in to your account">
      <LoginForm {...args} />
    </AuthContainer>
  ),
}

export const WithSignupLink: Story = {
  args: {
    showSignupLink: true,
  },
  render: (args) => (
    <AuthContainer title="Welcome back" subtitle="Sign in to your account">
      <LoginForm {...args} />
    </AuthContainer>
  ),
}

export const EmailOnly: Story = {
  args: { showSignupLink: false },
  parameters: {
    authContext: {
      enabledMethods: { email: true, google: false, github: false, otp: false },
    },
  },
  render: (args) => (
    <AuthContainer title="Welcome back" subtitle="Sign in to your account">
      <LoginForm {...args} />
    </AuthContainer>
  ),
}
