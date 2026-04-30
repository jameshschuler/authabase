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
    showLoginLink: { control: 'boolean' },
    minPasswordLength: { control: { type: 'number', min: 6, max: 32 } },
  },
}

export default meta
type Story = StoryObj<typeof SignupForm>

export const Default: Story = {
  args: {
    showLoginLink: false,
    minPasswordLength: 8,
  },
  render: (args) => (
    <AuthContainer title="Create an account" subtitle="Sign up to get started">
      <SignupForm {...args} />
    </AuthContainer>
  ),
}

export const WithLoginLink: Story = {
  args: {
    showLoginLink: true,
    minPasswordLength: 8,
  },
  render: (args) => (
    <AuthContainer title="Create an account" subtitle="Sign up to get started">
      <SignupForm {...args} />
    </AuthContainer>
  ),
}

export const StrictPasswordPolicy: Story = {
  args: {
    showLoginLink: false,
    minPasswordLength: 12,
  },
  render: (args) => (
    <AuthContainer title="Create an account" subtitle="Minimum 12-character password required">
      <SignupForm {...args} />
    </AuthContainer>
  ),
}
