/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEMO_OTP_API_URL?: string
  readonly VITE_DEMO_OTP_VERIFY_API_URL?: string
  readonly VITE_DEMO_CURRENT_USER_API_URL?: string
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
