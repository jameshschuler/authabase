import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EmailInput } from '../components/inputs/EmailInput'
import { PasswordInput } from '../components/inputs/PasswordInput'
import { Button } from '../components/ui/Button'

describe('UI Components', () => {
  describe('Button', () => {
    it('renders button with text', () => {
      const { getByText } = render(<Button>Click me</Button>)
      expect(getByText('Click me')).toBeInTheDocument()
    })

    it('handles click events', async () => {
      const handleClick = vi.fn()
      const { getByText } = render(<Button onClick={handleClick}>Click me</Button>)
      const button = getByText('Click me')
      await userEvent.click(button)
      expect(handleClick).toHaveBeenCalledOnce()
    })

    it('disables when disabled prop is true', () => {
      const { getByText } = render(<Button disabled>Click me</Button>)
      const button = getByText('Click me')
      expect(button).toBeDisabled()
    })

    it('applies variant styles correctly', () => {
      const { container } = render(<Button variant="destructive">Delete</Button>)
      const button = container.querySelector('button')
      expect(button).toHaveClass('bg-destructive/10')
    })
  })

  describe('EmailInput', () => {
    it('renders email input with label', () => {
      const { getByText, getByDisplayValue } = render(<EmailInput label="Email Address" />)
      expect(getByText('Email Address')).toBeInTheDocument()
      expect(getByDisplayValue('')).toHaveAttribute('type', 'email')
    })

    it('displays error message', () => {
      const { getByText } = render(<EmailInput label="Email" error="Invalid email" />)
      expect(getByText('Invalid email')).toBeInTheDocument()
    })

    it('updates value on input', async () => {
      const user = userEvent.setup()
      const { container } = render(<EmailInput />)
      const input = container.querySelector('input') as HTMLInputElement
      await user.type(input, 'test@example.com')
      expect(input.value).toBe('test@example.com')
    })
  })

  describe('PasswordInput', () => {
    it('renders password input as hidden by default', () => {
      const { container } = render(<PasswordInput label="Password" />)
      const input = container.querySelector('input') as HTMLInputElement
      expect(input.type).toBe('password')
    })

    it('toggles password visibility', async () => {
      const user = userEvent.setup()
      const { container, getByRole } = render(<PasswordInput label="Password" />)
      const input = container.querySelector('input') as HTMLInputElement
      const toggleButton = getByRole('button')

      expect(input.type).toBe('password')
      await user.click(toggleButton)
      expect(input.type).toBe('text')
      await user.click(toggleButton)
      expect(input.type).toBe('password')
    })

    it('shows strength indicator when enabled', () => {
      const { container } = render(
        <PasswordInput label="Password" value="Test123!" showStrengthIndicator={true} />
      )
      expect(container.textContent).toContain('Strength:')
    })

    it('displays error message', () => {
      const { getByText } = render(<PasswordInput label="Password" error="Password too short" />)
      expect(getByText('Password too short')).toBeInTheDocument()
    })
  })
})
