export {}

declare global {
  interface Window {
    AppVersion: string
    config: { [key: string]: any }
  }
}
