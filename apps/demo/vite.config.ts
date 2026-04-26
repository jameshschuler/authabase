import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: {
      '@authabase/react': path.resolve(__dirname, '../../packages/react-lib/src/index.ts'),
      '@': path.resolve(__dirname, '../../packages/react-lib/src')
    }
  },
  server: {
    fs: {
      allow: ['..', '../..']
    }
  }
})
