declare const APP_VERSION: string

declare module '*.module.scss' {
  const classes: { [key: string]: string }
  export default classes
}

interface ImportMetaEnv {
  readonly DEV_PROXY_URL: string
  readonly DEV_APP_TOKEN: string
  readonly DEV_PUBLIC_PATH?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

/// <reference types="vite/client" />
