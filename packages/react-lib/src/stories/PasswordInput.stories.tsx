import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { PasswordInput } from '../components/inputs/PasswordInput'

const meta: Meta<typeof PasswordInput> = {
  title: 'Inputs/PasswordInput',
  component: PasswordInput,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    placeholder: { control: 'text' },
    error: { control: 'text' },
    showStrengthIndicator: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof PasswordInput>

export const Default: Story = {
  args: {
    label: 'Password',
    placeholder: 'Enter your password',
    id: 'password',
  },
}

export const WithStrengthIndicator: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [value, setValue] = useState('')
    return (
      <PasswordInput
        id="password"
        label="Password"
        placeholder="Enter a password"
        showStrengthIndicator
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    )
  },
}

export const WithError: Story = {
  args: {
    label: 'Password',
    placeholder: 'Enter your password',
    id: 'password',
    error: 'Password must be at least 8 characters',
  },
}

export const Disabled: Story = {
  args: {
    label: 'Password',
    placeholder: 'Enter your password',
    id: 'password',
    disabled: true,
  },
}
