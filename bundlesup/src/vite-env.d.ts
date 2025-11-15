/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SHOPIFY_API_KEY: string
  readonly VITE_APP_URL: string
  readonly VITE_BASE44_APP_ID: string
  readonly VITE_BASE44_API_URL: string
  readonly VITE_FUNCTIONS_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
