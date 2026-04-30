import type { Meta, StoryObj } from '@storybook/react'
import { AuthContainer } from '../components/containers/AuthContainer'
import { MagicLinkForm } from '../components/auth/MagicLinkForm'

const meta: Meta<typeof MagicLinkForm> = {
  title: 'Auth/MagicLinkForm',
  component: MagicLinkForm,
  tags: ['autodocs'],
  argTypes: {
    onSuccess: { action: 'onSuccess' },
    onError: { action: 'onError' },
    redirectTo: { control: 'text' },
  },
}

export default meta
type Story = StoryObj<typeof MagicLinkForm>

export const Default: Story = {
  args: {},
  render: (args) => (
    <AuthContainer title="Sign in with a magic link" subtitle="We'll send a link to your email">
      <MagicLinkForm {...args} />
    </AuthContainer>
  ),
}

export const EmailDisabled: Story = {
  args: {},
  parameters: {
    authContext: {
      enabledMethods: { email: false, google: true, github: true, otp: true },
    },
  },
  render: (args) => (
    <AuthContainer title="Sign in with a magic link" subtitle="Email auth is disabled">
      <MagicLinkForm {...args} />
    </AuthContainer>
  ),
}
