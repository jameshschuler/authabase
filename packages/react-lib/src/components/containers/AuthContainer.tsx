import { cn } from '../../lib/utils'
import type { AuthContainerProps } from '../../types'

export function AuthContainer({ children, title, subtitle, className }: AuthContainerProps) {
  return (
    <div
      className={cn(
        'auth-page flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8',
        className
      )}
    >
      <div className="w-full max-w-md">
        {(title || subtitle) && (
          <div className="mb-6 text-center sm:mb-8">
            {title && <h1 className="text-3xl font-bold tracking-tight">{title}</h1>}
            {subtitle && <p className="auth-muted mt-2 text-sm">{subtitle}</p>}
          </div>
        )}
        <div className="auth-card rounded-lg border p-6 shadow-sm sm:p-8">{children}</div>
      </div>
    </div>
  )
}

AuthContainer.displayName = 'AuthContainer'
