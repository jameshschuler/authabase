import { Button as ButtonPrimitive } from '@base-ui/react/button'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../../lib/utils'

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: 'bg-[var(--auth-primary)] text-[var(--auth-primary-foreground)] hover:opacity-90',
        outline:
          'border-[var(--auth-border)] bg-[var(--auth-surface)] text-[var(--auth-fg)] hover:bg-[var(--auth-muted-bg)] hover:text-[var(--auth-fg)] aria-expanded:bg-[var(--auth-muted-bg)] aria-expanded:text-[var(--auth-fg)]',
        secondary:
          'bg-[var(--auth-muted-bg)] text-[var(--auth-fg)] hover:opacity-90 aria-expanded:bg-[var(--auth-muted-bg)] aria-expanded:text-[var(--auth-fg)]',
        ghost:
          'hover:bg-[var(--auth-muted-bg)] hover:text-[var(--auth-fg)] aria-expanded:bg-[var(--auth-muted-bg)] aria-expanded:text-[var(--auth-fg)]',
        destructive:
          'bg-[var(--auth-danger-bg)] text-[var(--auth-danger-fg)] hover:opacity-90 focus-visible:border-[var(--auth-danger-fg)] focus-visible:ring-1 focus-visible:ring-[var(--auth-danger-fg)]',
        link: 'auth-link underline-offset-4 hover:underline',
      },
      size: {
        default:
          'h-9 gap-2 px-4 has-data-[icon=inline-end]:pr-3.5 has-data-[icon=inline-start]:pl-3.5',
        xs: "h-7 gap-1.5 rounded-[min(var(--radius-md),10px)] px-3.5 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-[min(var(--radius-md),12px)] px-4 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3 [&_svg:not([class*='size-'])]:size-3.5",
        lg: 'h-10 gap-2 px-5 has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4',
        icon: 'size-8',
        'icon-xs':
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        'icon-sm':
          'size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg',
        'icon-lg': 'size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

function Button({
  className,
  variant = 'default',
  size = 'default',
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Button, buttonVariants }
