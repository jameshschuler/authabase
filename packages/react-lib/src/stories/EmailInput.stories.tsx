import type { Meta, StoryObj } from '@storybook/react'
import { EmailInput } from '../components/inputs/EmailInput'

const meta: Meta<typeof EmailInput> = {
  title: 'Inputs/EmailInput',
  component: EmailInput,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    placeholder: { control: 'text' },
    error: { control: 'text' },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof EmailInput>

export const Default: Story = {
  args: {
    label: 'Email',
    placeholder: 'you@example.com',
    id: 'email',
  },
}

export const WithError: Story = {
  args: {
    label: 'Email',
    placeholder: 'you@example.com',
    id: 'email',
    error: 'Invalid email address',
  },
}

export const Disabled: Story = {
  args: {
    label: 'Email',
    placeholder: 'you@example.com',
    id: 'email',
    disabled: true,
  },
}
