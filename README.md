# AuthABase - Reusable React Auth Components

A flexible, type-safe React authentication component library built with TypeScript, shadcn UI, TailwindCSS, and Supabase integration.

## Features

✅ **Multiple Auth Methods**

- Email/Password authentication
- Google OAuth
- GitHub OAuth
- One-Time Password (OTP) via email

✅ **Fully Customizable**

- Configurable auth methods
- Easy theming with Tailwind CSS
- Responsive design for mobile and desktop
- Component-level error handling

✅ **Developer Experience**

- TypeScript for type safety
- React Context API for state management
- Built-in form validation with Zod
- Comprehensive test coverage
- ESLint + Prettier configuration

✅ **Security**

- Password strength indicator
- Secure password visibility toggle
- OTP-based authentication
- OAuth integration with Supabase

## Installation

```bash
npm install @authabase/react
# or
yarn add @authabase/react
# or
pnpm add @authabase/react
```

### Peer Dependencies

```bash
npm install react react-dom @fortawesome/react-fontawesome @fortawesome/fontawesome-svg-core @fortawesome/free-brands-svg-icons
```

## Quick Start

### 1. Set Up AuthProvider

Wrap your application with the `AuthProvider`:

```tsx
import { AuthProvider } from '@authabase/react'

function App() {
  return (
    <AuthProvider
      config={{
        supabaseUrl: process.env.REACT_APP_SUPABASE_URL,
        supabaseKey: process.env.REACT_APP_SUPABASE_KEY,
        redirectUrl: window.location.origin,
        enabledMethods: {
          email: true,
          google: true,
          github: true,
          otp: true,
        },
      }}
    >
      <YourApp />
    </AuthProvider>
  )
}
```

### 2. Use Auth Components

```tsx
import { LoginForm, AuthContainer } from '@authabase/react'

function LoginPage() {
  return (
    <AuthContainer title="Welcome Back" subtitle="Sign in to your account">
      <LoginForm
        onSuccess={(user) => console.log('Logged in:', user)}
        onError={(error) => console.error('Login failed:', error)}
        showSignupLink
      />
    </AuthContainer>
  )
}
```

### 3. Access Auth State

Use the `useAuth` hook anywhere in your app:

```tsx
import { useAuth } from '@authabase/react'

function Profile() {
  const { user, isLoading, signOut } = useAuth()

  if (isLoading) return <div>Loading...</div>
  if (!user) return <div>Not authenticated</div>

  return (
    <div>
      <p>Email: {user.email}</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  )
}
```

## Components

### LoginForm

Email/password login with social auth options.

```tsx
<LoginForm onSuccess={(user) => {}} onError={(error) => {}} showSignupLink={true} />
```

### SignupForm

User registration with password strength indicator.

```tsx
<SignupForm onSuccess={(user) => {}} onError={(error) => {}} showLoginLink={true} />
```

### OTPForm

One-Time Password authentication flow.

```tsx
<OTPForm onSuccess={(user) => {}} onError={(error) => {}} />
```

### ForgotPasswordForm

Sends a password reset email to the user.

```tsx
<ForgotPasswordForm onSuccess={() => {}} onError={(error) => {}} />
```

### MagicLinkForm

Passwordless sign-in via a magic link sent to the user's email.

```tsx
<MagicLinkForm onSuccess={() => {}} onError={(error) => {}} />
```

### ResetPasswordForm

Allows the user to set a new password after clicking a reset link.

```tsx
<ResetPasswordForm onSuccess={(user) => {}} onError={(error) => {}} />
```

### SocialAuthButton

Standalone OAuth button for Google or GitHub.

```tsx
<SocialAuthButton provider="google" onSuccess={(user) => {}} onError={(error) => {}} />
```

### AuthContainer

Layout container for auth pages.

```tsx
<AuthContainer title="Authenticate" subtitle="Choose your preferred method">
  {/* Your auth components */}
</AuthContainer>
```

### Input Components

- `EmailInput` - Email field with validation
- `PasswordInput` - Password field with visibility toggle and strength indicator

```tsx
<EmailInput
  label="Email"
  placeholder="user@example.com"
  error={errors.email}
  onChange={handleChange}
/>

<PasswordInput
  label="Password"
  showStrengthIndicator
  error={errors.password}
  onChange={handleChange}
/>
```

## Styling

The library uses Tailwind CSS with custom CSS variables. Customize the theme by modifying CSS variables:

```css
:root {
  --primary: 0 0% 9%;
  --destructive: 0 84.2% 60.2%;
  --radius: 0.5rem;
  /* ... other variables */
}
```

## Using with shadcn/ui (Consumer Setup)

If you consume this package in another app, keep in mind:

- Your app owns `components.json`
- shadcn CLI reads the consumer app config, not configs shipped inside npm dependencies
- Theme and component behavior should be customized through your app's Tailwind/CSS variables and component props

### 1. Install package + peer dependencies

```bash
npm install @authabase/react
npm install react react-dom @fortawesome/react-fontawesome @fortawesome/fontawesome-svg-core
```

### 2. Initialize shadcn in the consumer app

```bash
npx shadcn@latest init
```

Example `components.json` in the consumer app:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/index.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

### 3. Optional: Wire a custom shadcn registry

If you publish an AuthABase shadcn registry, consumers can add it to their own config:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "registries": {
    "@authabase": "https://your-registry-domain.com/r/{name}.json"
  }
}
```

Then they can install from that registry in their app:

```bash
npx shadcn@latest add @authabase/login-form
```

### 4. Customize appearance

Consumers can override visual design by changing CSS variables and Tailwind tokens in their own app styles, for example:

```css
:root {
  --primary: 222 47% 11%;
  --destructive: 0 72% 51%;
  --radius: 0.75rem;
}
```

## Environment Variables

Create a `.env` file:

```env
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_KEY=your-anon-key
```

## Development

### Install Dependencies

```bash
npm install
```

### Development Server

```bash
npm run dev
```

### Build Library

```bash
npm run build
```

### Run Tests

```bash
npm test
```

### Coverage Report

```bash
npm run test:coverage
```

### Linting & Formatting

```bash
npm run lint
npm run lint:fix
npm run format
npm run format:check
```

### Type Checking

```bash
npm run type-check
```

## Project Structure

```
src/
├── components/
│   ├── auth/              # Auth form components
│   ├── inputs/            # Form input components
│   ├── containers/        # Layout containers
│   ├── ui/                # Base UI components
│   └── index.ts           # Component exports
├── provider/              # AuthProvider and useAuth hook
├── types/                 # TypeScript type definitions
├── lib/                   # Utility functions
├── styles/                # Global styles
├── tests/                 # Test files
└── index.ts              # Main entry point
```

## Configuration

### AuthConfig Interface

```typescript
interface AuthConfig {
  supabaseUrl: string
  supabaseKey: string
  redirectUrl?: string
  enabledMethods?: {
    email?: boolean
    google?: boolean
    github?: boolean
    otp?: boolean
  }
  onAuthSuccess?: (user: AuthUser) => void
  onAuthError?: (error: Error) => void
}
```

## Mobile Friendly

All components are responsive and mobile-optimized:

- Flexible layout that adapts to screen size
- Touch-friendly buttons and inputs
- Optimized font sizes for readability
- Proper spacing for mobile devices

## Testing

The library includes comprehensive tests using Vitest and React Testing Library:

```bash
npm test                 # Run tests
npm run test:ui          # Open test UI
npm run test:coverage    # Generate coverage report
```

## TypeScript Support

Full TypeScript support with proper type definitions:

```tsx
import type { AuthUser, AuthConfig, LoginFormProps } from '@authabase/react'
```

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to get started, branch naming, testing requirements, and the PR process.

## License

ISC — see [LICENSE](LICENSE) for details.

## License

MIT

## Support

For issues, questions, or suggestions, please open an issue on GitHub.

## Changelog

### v0.1.0

Initial release with:

- Email/Password authentication
- Google and GitHub OAuth
- OTP-based authentication
- React Context API provider
- Comprehensive component library
- Full TypeScript support
- Test coverage
- ESLint and Prettier configuration
