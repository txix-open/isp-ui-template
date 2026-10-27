function stringConfig(key: string, fallback: string): string {
  const value = window.config?.[key]
  if (value === undefined) return fallback
  if (typeof value !== 'string')
    throw new Error(`Некорректная настройка ${key}`)
  return value
}
export const appConfig = {
  name: stringConfig('APP_NAME', import.meta.env.VITE_APP_NAME || APP_NAME),
  token: stringConfig('APP_TOKEN', import.meta.env.VITE_APP_TOKEN || '')
}
