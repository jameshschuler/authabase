import React from 'react'
import type { Preview, Decorator } from '@storybook/react'
import { AuthContext } from '../src/provider'
import type { AuthContextType } from '../src/types'
import '../src/styles/globals.css'

/** Default mock auth context — no user signed in, all methods enabled */
export const mockAuthContext: AuthContextType = {
  user: null,
  supabase: null,
  isLoading: false,
  error: null,
  enabledMethods: {
    email: true,
    google: true,
    github: true,
    otp: true,
  },
  signOut: async () => {},
  refreshSession: async () => {},
}

export const withAuthContext: Decorator = (Story, context) => {
  const authOverrides: Partial<AuthContextType> = context.parameters.authContext ?? {}
  const value: AuthContextType = { ...mockAuthContext, ...authOverrides }

  return (
    <AuthContext.Provider value={value}>
      <div className="flex min-h-screen items-center justify-center bg-background p-8">
        <div className="w-full max-w-md">
          <Story />
        </div>
      </div>
    </AuthContext.Provider>
  )
}

const preview: Preview = {
  decorators: [withAuthContext],
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    layout: 'fullscreen',
  },
}

export default preview
