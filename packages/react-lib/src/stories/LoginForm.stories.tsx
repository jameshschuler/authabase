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
    onSignupClick: { action: 'onSignupClick' },
    onForgotPasswordClick: { action: 'onForgotPasswordClick' },
    onSubmitStart: { action: 'onSubmitStart' },
    onSubmitComplete: { action: 'onSubmitComplete' },
    onValidationError: { action: 'onValidationError' },
    showSignupLink: { control: 'boolean' },
    showForgotPasswordLink: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof LoginForm>

const wrap = (story: React.ReactNode) => (
  <AuthContainer title="Welcome back" subtitle="Sign in to your account">
    {story}
  </AuthContainer>
)

export const Default: Story = {
  args: { showSignupLink: false },
  render: (args) => wrap(<LoginForm {...args} />),
}

export const WithSignupLink: Story = {
  args: { showSignupLink: true },
  render: (args) => wrap(<LoginForm {...args} />),
}

export const WithForgotPassword: Story = {
  args: { showSignupLink: true, showForgotPasswordLink: true },
  render: (args) => wrap(<LoginForm {...args} />),
}

export const WithNavigationCallbacks: Story = {
  args: {
    showSignupLink: true,
    showForgotPasswordLink: true,
    onSignupClick: () => alert('Navigate to signup'),
    onForgotPasswordClick: () => alert('Navigate to forgot password'),
  },
  render: (args) => wrap(<LoginForm {...args} />),
}

export const CustomCopy: Story = {
  args: {
    showSignupLink: true,
    showForgotPasswordLink: true,
    copy: {
      emailLabel: 'Work Email',
      emailPlaceholder: 'you@company.com',
      passwordLabel: 'Passphrase',
      submitButton: 'Log In',
      loadingButton: 'Logging in...',
      signupPrompt: 'New here?',
      signupLink: 'Create account',
      forgotPasswordLink: 'Reset passphrase',
    },
  },
  render: (args) => wrap(<LoginForm {...args} />),
}

export const EmailOnly: Story = {
  args: { showSignupLink: false },
  parameters: {
    authContext: {
      enabledMethods: { email: true, google: false, github: false, otp: false },
    },
  },
  render: (args) => wrap(<LoginForm {...args} />),
}

export const SocialOnly: Story = {
  args: { showSignupLink: false },
  parameters: {
    authContext: {
      enabledMethods: { email: false, google: true, github: true, otp: false },
    },
  },
  render: (args) => wrap(<LoginForm {...args} />),
}

export const WithErrorMapping: Story = {
  args: {
    mapError: (err) => {
      if (err.message.includes('Invalid login credentials')) return 'Wrong email or password.'
      return err.message
    },
  },
  render: (args) => wrap(<LoginForm {...args} />),
}
