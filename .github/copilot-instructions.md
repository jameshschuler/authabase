<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## AuthABase React Auth Components Library

This is a reusable React authentication components library built with TypeScript, shadcn UI, TailwindCSS, and Supabase integration.

### Project Guidelines

- **Language**: TypeScript with strict mode enabled
- **UI Framework**: React 18+ with shadcn UI components
- **Styling**: Tailwind CSS with custom CSS variables
- **Icons**: FontAwesome for all UI icons
- **State Management**: React Context API
- **Forms**: Zod for validation
- **Testing**: Vitest + React Testing Library
- **Linting**: ESLint with TypeScript support
- **Formatting**: Prettier

### Development Standards

- Write all components with TypeScript
- Use functional components with hooks
- Implement proper error handling and validation
- Write tests for new features
- Follow Prettier formatting rules
- Keep components focused and reusable
- Document complex logic with comments
- Use semantic HTML and accessibility best practices

### Key Features

- Multiple authentication methods (email/password, Google, GitHub, OTP)
- Configurable auth methods via AuthConfig
- Built-in password strength indicator
- Responsive design for all screen sizes
- Comprehensive error handling
- Mobile-friendly components
- Full TypeScript support

### Useful Commands

- `npm install` - Install dependencies
- `npm run dev` - Start development server
- `npm run build` - Build library
- `npm test` - Run tests
- `npm run lint` - Check for linting issues
- `npm run format` - Format code with Prettier
- `npm run type-check` - Check TypeScript types

### File Structure

- `src/components/` - React components
- `src/provider/` - AuthProvider and useAuth hook
- `src/types/` - TypeScript type definitions
- `src/lib/` - Utility functions
- `src/styles/` - Global CSS
- `src/tests/` - Test files
