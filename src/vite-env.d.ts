declare const APP_VERSION: string

declare module '*.module.scss' {
  const classes: { [key: string]: string }
  export default classes
}

/// <reference types="vite/client" />
