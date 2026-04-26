import React, { useState } from 'react'
import { Input } from '../ui/Input'
import { Label } from '../ui/Label'
import { cn, getPasswordStrength } from '../../lib/utils'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import type { PasswordInputProps } from '../../types'

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, showStrengthIndicator = false, className, value, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const strength =
      showStrengthIndicator && typeof value === 'string' ? getPasswordStrength(value) : null

    return (
      <div className="space-y-2">
        {label && <Label htmlFor={props.id}>{label}</Label>}
        <div className="relative">
          <Input
            ref={ref}
            type={showPassword ? 'text' : 'password'}
            value={value}
            className={cn('pr-10', error && 'border-destructive', className)}
            {...props}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            tabIndex={-1}
          >
            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
          </button>
        </div>
        {showStrengthIndicator && strength && (
          <div className="space-y-1">
            <div className="flex h-2 gap-1 overflow-hidden rounded-full bg-secondary">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={cn('flex-1', i < strength.score ? strength.color : 'bg-muted')}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Strength: <span className="font-medium">{strength.text}</span>
            </p>
          </div>
        )}
        {error && <p className="text-sm font-medium text-destructive">{error}</p>}
      </div>
    )
  }
)

PasswordInput.displayName = 'PasswordInput'
