export {}

declare global {
  interface Window {
    config: { [key: string]: unknown }
    APP_VERSION: string
  }
}
