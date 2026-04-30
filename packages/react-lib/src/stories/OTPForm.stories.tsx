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
    defaultMethod: {
      control: 'radio',
      options: ['email', 'phone'],
    },
  },
}

export default meta
type Story = StoryObj<typeof OTPForm>

export const EmailOTP: Story = {
  args: {
    defaultMethod: 'email',
    enabledMethods: { email: true, phone: false },
  },
  render: (args) => (
    <AuthContainer title="One-time password" subtitle="We'll send a code to your email">
      <OTPForm {...args} />
    </AuthContainer>
  ),
}

export const PhoneOTP: Story = {
  args: {
    defaultMethod: 'phone',
    enabledMethods: { email: false, phone: true },
  },
  render: (args) => (
    <AuthContainer title="One-time password" subtitle="We'll send a code to your phone">
      <OTPForm {...args} />
    </AuthContainer>
  ),
}

export const BothMethods: Story = {
  args: {
    defaultMethod: 'email',
    enabledMethods: { email: true, phone: true },
  },
  render: (args) => (
    <AuthContainer title="One-time password" subtitle="Choose how to receive your code">
      <OTPForm {...args} />
    </AuthContainer>
  ),
}
