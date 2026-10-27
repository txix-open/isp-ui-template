export {}

declare global {
  interface Window {
    config?: Record<string, unknown>
    AppVersion: string
  }
}
