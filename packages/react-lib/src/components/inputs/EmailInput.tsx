import React from 'react'
import { Input } from '../ui/Input'
import { Label } from '../ui/Label'
import { cn } from '../../lib/utils'
import type { EmailInputProps } from '../../types'

export const EmailInput = React.forwardRef<HTMLInputElement, EmailInputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && <Label htmlFor={props.id}>{label}</Label>}
        <Input
          ref={ref}
          type="email"
          className={cn(error && 'border-destructive', className)}
          {...props}
        />
        {error && <p className="text-sm font-medium text-destructive">{error}</p>}
      </div>
    )
  }
)

EmailInput.displayName = 'EmailInput'
