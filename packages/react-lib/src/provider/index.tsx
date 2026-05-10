import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
  useMemo,
} from 'react'
import { createClient } from '@supabase/supabase-js'
import type { AuthContextType, AuthConfig, AuthUser } from '../types'

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  config: AuthConfig
  children: ReactNode
}

export function AuthProvider({ config, children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Check if Supabase credentials are provided
  const hasValidConfig = config.supabaseUrl && config.supabaseKey
  const enabledMethods = useMemo(
    () => ({
      email: config.enabledMethods?.email ?? true,
      google: config.enabledMethods?.google ?? true,
      github: config.enabledMethods?.github ?? true,
      otp: config.enabledMethods?.otp ?? true,
    }),
    [config.enabledMethods]
  )

  const supabase = useMemo(() => {
    if (!hasValidConfig) {
      return null
    }
    return createClient(config.supabaseUrl, config.supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  }, [config.supabaseUrl, config.supabaseKey, hasValidConfig])

  const applyUser = useCallback(
    (nextUser: AuthUser | null) => {
      setUser(nextUser)
      if (nextUser) {
        config.onAuthSuccess?.(nextUser)
      }
    },
    [config.onAuthSuccess]
  )

  const loadBackendUser = useCallback(async () => {
    if (!config.getCurrentUser) return null
    const backendUser = await config.getCurrentUser()
    applyUser(backendUser ?? null)
    return backendUser ?? null
  }, [applyUser, config.getCurrentUser])

  useEffect(() => {
    if (!supabase && !config.getCurrentUser) {
      // If no valid Supabase config, just finish loading without auth
      setIsLoading(false)
      setError(
        new Error(
          'Supabase credentials not configured. Please provide VITE_SUPABASE_URL and VITE_SUPABASE_KEY environment variables.'
        )
      )
      return
    }

    const initializeAuth = async () => {
      try {
        setIsLoading(true)

        if (config.getCurrentUser) {
          await loadBackendUser()
          return
        }

        if (!supabase) {
          return
        }

        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (session?.user) {
          applyUser({
            id: session.user.id,
            email: session.user.email,
            user_metadata: session.user.user_metadata,
          })
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to initialize auth')
        setError(error)
        config.onAuthError?.(error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()

    if (!supabase) {
      return
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        applyUser({
          id: session.user.id,
          email: session.user.email,
          user_metadata: session.user.user_metadata,
        })
      } else {
        applyUser(null)
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [
    supabase,
    config.getCurrentUser,
    config.onAuthError,
    config.onAuthSuccess,
    loadBackendUser,
    applyUser,
  ])

  const signOut = async () => {
    try {
      if (!supabase) throw new Error('Supabase not configured')
      await supabase.auth.signOut()
      setUser(null)
      setError(null)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to sign out')
      setError(error)
      config.onAuthError?.(error)
    }
  }

  const refreshSession = async () => {
    try {
      if (config.getCurrentUser) {
        await loadBackendUser()
        return
      }

      if (!supabase) throw new Error('Supabase not configured')
      const {
        data: { session },
      } = await supabase.auth.refreshSession()
      if (session?.user) {
        applyUser({
          id: session.user.id,
          email: session.user.email,
          user_metadata: session.user.user_metadata,
        })
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to refresh session')
      setError(error)
      config.onAuthError?.(error)
    }
  }

  const value: AuthContextType = {
    user,
    supabase,
    enabledMethods,
    isLoading,
    error,
    signOut,
    refreshSession,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
