import type { Meta, StoryObj } from '@storybook/react'
import { SocialAuthButton } from '../components/auth/SocialAuthButton'

const meta: Meta<typeof SocialAuthButton> = {
  title: 'Auth/SocialAuthButton',
  component: SocialAuthButton,
  tags: ['autodocs'],
  argTypes: {
    onSuccess: { action: 'onSuccess' },
    onError: { action: 'onError' },
    provider: {
      control: 'radio',
      options: ['google', 'github'],
    },
  },
}

export default meta
type Story = StoryObj<typeof SocialAuthButton>

export const Google: Story = {
  args: { provider: 'google' },
}

export const GitHub: Story = {
  args: { provider: 'github' },
}

export const BothProviders: Story = {
  render: () => (
    <div className="flex flex-col gap-3 w-64">
      <SocialAuthButton provider="google" />
      <SocialAuthButton provider="github" />
    </div>
  ),
}
