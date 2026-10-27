import type { Session } from '../types/auth'

export function hasPermissions(
  granted: readonly string[],
  required: string | readonly string[],
  mode: 'any' | 'all' = 'any'
): boolean {
  const keys = typeof required === 'string' ? [required] : required
  if (keys.length === 0) return true
  return mode === 'all'
    ? keys.every((key) => granted.includes(key))
    : keys.some((key) => granted.includes(key))
}

export function isSession(value: unknown): value is Session {
  if (typeof value !== 'object' || value === null) return false
  return (
    'token' in value &&
    typeof value.token === 'string' &&
    value.token.trim().length > 0 &&
    /^\P{Cc}+$/u.test(value.token) &&
    'headerName' in value &&
    typeof value.headerName === 'string' &&
    /^x-[a-z0-9-]+$/i.test(value.headerName) &&
    value.headerName.toLowerCase() !== 'x-application-token'
  )
}

export function safeReturnPath(value: unknown): string {
  return typeof value === 'string' &&
    value.startsWith('/') &&
    !value.startsWith('//') &&
    !value.includes('\\')
    ? value
    : '/'
}
