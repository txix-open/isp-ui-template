import { authApi } from '../services/authApi'
import { useAppSelector } from './redux'
import { hasPermissions } from '../utils/access'

export function useProfile() {
  const session = useAppSelector((state) => state.session.current)
  const query = authApi.useProfileQuery(undefined, { skip: !session })
  return {
    ...query,
    session,
    can: (required: string | readonly string[], mode: 'any' | 'all' = 'any') =>
      hasPermissions(query.data?.permissions || [], required, mode)
  }
}
