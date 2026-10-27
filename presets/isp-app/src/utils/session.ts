import type { Session } from '../types/auth'
import { isSession } from './access'

// Сессии разных приложений на одном origin не пересекаются; вкладка хранит свою сессию.
const sessionKey = `isp-app:${import.meta.env.BASE_URL}:session`
export function readSession(): Session | null {
  try {
    const value: unknown = JSON.parse(
      sessionStorage.getItem(sessionKey) || 'null'
    )
    return isSession(value) ? value : null
  } catch {
    return null
  }
}
export function writeSession(session: Session | null): void {
  if (session) sessionStorage.setItem(sessionKey, JSON.stringify(session))
  else sessionStorage.removeItem(sessionKey)
}
