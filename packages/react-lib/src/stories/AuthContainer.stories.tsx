import type { Meta, StoryObj } from '@storybook/react'
import { AuthContainer } from '../components/containers/AuthContainer'

const meta: Meta<typeof AuthContainer> = {
  title: 'Containers/AuthContainer',
  component: AuthContainer,
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
  },
}

export default meta
type Story = StoryObj<typeof AuthContainer>

export const Default: Story = {
  args: {
    title: 'Welcome',
    subtitle: 'Sign in to your account',
    children: (
      <p className="text-sm text-muted-foreground text-center">Your auth form goes here.</p>
    ),
  },
}

export const TitleOnly: Story = {
  args: {
    title: 'Create an account',
    children: (
      <p className="text-sm text-muted-foreground text-center">Your auth form goes here.</p>
    ),
  },
}

export const NoHeader: Story = {
  args: {
    children: <p className="text-sm text-muted-foreground text-center">No title or subtitle.</p>,
  },
}
