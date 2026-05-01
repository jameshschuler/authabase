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
    onSubmitStart: { action: 'onSubmitStart' },
    onSubmitComplete: { action: 'onSubmitComplete' },
    onValidationError: { action: 'onValidationError' },
    redirectTo: { control: 'text' },
  },
}

export default meta
type Story = StoryObj<typeof MagicLinkForm>

const wrap = (subtitle: string, story: React.ReactNode) => (
  <AuthContainer title="Sign in with a magic link" subtitle={subtitle}>
    {story}
  </AuthContainer>
)

export const Default: Story = {
  args: {},
  render: (args) => wrap("We'll send a link to your email", <MagicLinkForm {...args} />),
}

export const CustomCopy: Story = {
  args: {
    copy: {
      emailLabel: 'Your Email',
      emailPlaceholder: 'hello@example.com',
      submitButton: 'Email me a login link',
      loadingButton: 'Sending link...',
      successMessage: 'Check your inbox! A sign-in link is on its way.',
    },
  },
  render: (args) => wrap("We'll email you a one-click login link", <MagicLinkForm {...args} />),
}

export const EmailDisabled: Story = {
  args: {},
  parameters: {
    authContext: {
      enabledMethods: { email: false, google: true, github: true, otp: true },
    },
  },
  render: (args) => wrap('Email auth is disabled', <MagicLinkForm {...args} />),
}
