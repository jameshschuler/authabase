import type { Meta, StoryObj } from '@storybook/react'
import { AuthContainer } from '../components/containers/AuthContainer'
import { SignupForm } from '../components/auth/SignupForm'

const meta: Meta<typeof SignupForm> = {
  title: 'Auth/SignupForm',
  component: SignupForm,
  tags: ['autodocs'],
  argTypes: {
    onSuccess: { action: 'onSuccess' },
    onError: { action: 'onError' },
    onLoginClick: { action: 'onLoginClick' },
    onSubmitStart: { action: 'onSubmitStart' },
    onSubmitComplete: { action: 'onSubmitComplete' },
    onValidationError: { action: 'onValidationError' },
    showLoginLink: { control: 'boolean' },
    minPasswordLength: { control: { type: 'number', min: 6, max: 32 } },
    requireUppercase: { control: 'boolean' },
    requireLowercase: { control: 'boolean' },
    requireNumber: { control: 'boolean' },
    requireSpecialChar: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof SignupForm>

const wrap = (story: React.ReactNode) => (
  <AuthContainer title="Create an account" subtitle="Sign up to get started">
    {story}
  </AuthContainer>
)

export const Default: Story = {
  args: { showLoginLink: false, minPasswordLength: 8 },
  render: (args) => wrap(<SignupForm {...args} />),
}

export const WithLoginLink: Story = {
  args: { showLoginLink: true },
  render: (args) => wrap(<SignupForm {...args} />),
}

export const WithNavigationCallback: Story = {
  args: {
    showLoginLink: true,
    onLoginClick: () => alert('Navigate to login'),
  },
  render: (args) => wrap(<SignupForm {...args} />),
}

export const StrictPasswordPolicy: Story = {
  args: {
    showLoginLink: false,
    minPasswordLength: 12,
    requireSpecialChar: true,
  },
  render: (args) => (
    <AuthContainer
      title="Create an account"
      subtitle="Minimum 12-character password with special character required"
    >
      <SignupForm {...args} />
    </AuthContainer>
  ),
}

export const RelaxedPasswordPolicy: Story = {
  args: {
    showLoginLink: false,
    minPasswordLength: 6,
    requireUppercase: false,
    requireNumber: false,
  },
  render: (args) => (
    <AuthContainer title="Create an account" subtitle="Minimum 6-character password">
      <SignupForm {...args} />
    </AuthContainer>
  ),
}

export const CustomCopy: Story = {
  args: {
    showLoginLink: true,
    copy: {
      emailLabel: 'Work Email',
      emailPlaceholder: 'you@company.com',
      submitButton: 'Create Account',
      loadingButton: 'Creating...',
      successMessage: 'Account created! Welcome aboard.',
      loginPrompt: 'Already a member?',
      loginLink: 'Log in',
      passwordMismatch: 'Those passwords do not match. Please try again.',
    },
  },
  render: (args) => wrap(<SignupForm {...args} />),
}
