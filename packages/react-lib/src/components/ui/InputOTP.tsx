import * as React from 'react'
import { OTPInput, OTPInputContext } from 'input-otp'

import { cn } from '../../lib/utils'

const InputOTP = React.forwardRef<
  React.ElementRef<typeof OTPInput>,
  React.ComponentPropsWithoutRef<typeof OTPInput>
>(({ className, containerClassName, ...props }, ref) => (
  <OTPInput
    ref={ref}
    containerClassName={cn('flex items-center gap-2 has-disabled:opacity-50', containerClassName)}
    className={cn('disabled:cursor-not-allowed', className)}
    {...props}
  />
))
InputOTP.displayName = 'InputOTP'

function InputOTPGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex items-center gap-2', className)} {...props} />
}

function InputOTPSlot({
  index,
  className,
  ...props
}: React.ComponentProps<'div'> & { index: number }) {
  const otpContext = React.useContext(OTPInputContext)
  const slot = otpContext.slots[index]

  return (
    <div
      className={cn(
        'auth-otp-slot relative flex h-10 w-10 items-center justify-center rounded-md border text-sm font-medium transition-all',
        slot.isActive && 'z-10',
        className
      )}
      data-active={slot.isActive ? 'true' : 'false'}
      {...props}
    >
      {slot.char ?? <span className="auth-otp-placeholder">•</span>}
    </div>
  )
}

export { InputOTP, InputOTPGroup, InputOTPSlot }
