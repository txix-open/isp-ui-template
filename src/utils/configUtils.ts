interface AppConfig {
  APP_NAME: string
  APP_TOKEN: string
}

export function getConfigProperty<K extends keyof AppConfig>(
  property: K,
  defaultValue: AppConfig[K]
): AppConfig[K] {
  const value: unknown = window.config?.[property]
  if (value === undefined) return defaultValue
  if (typeof value !== 'string')
    throw new Error(`Некорректная настройка ${property}`)
  return value
}

export const appConfig = {
  name: getConfigProperty(
    'APP_NAME',
    import.meta.env.VITE_APP_NAME || APP_NAME
  ),
  token: getConfigProperty('APP_TOKEN', import.meta.env.VITE_APP_TOKEN || '')
}
