import { cn } from '../../lib/utils'
import type { AuthContainerProps } from '../../types'

export function AuthContainer({
  children,
  title,
  subtitle,
  className,
}: AuthContainerProps) {
  return (
    <div
      className={cn(
        'flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8',
        className
      )}
    >
      <div className="w-full max-w-md space-y-8">
        {(title || subtitle) && (
          <div className="text-center">
            {title && (
              <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
            )}
            {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
          </div>
        )}
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm sm:p-8">
          {children}
        </div>
      </div>
    </div>
  )
}

AuthContainer.displayName = 'AuthContainer'
