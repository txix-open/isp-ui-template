/// <reference types="vite/client" />
declare const APP_VERSION: string
declare const APP_NAME: string

interface ImportMetaEnv {
  readonly VITE_APP_NAME?: string
  readonly VITE_APP_TOKEN?: string
}
