import { App } from 'antd'
import { authApi } from '../services/authApi'
import { sessionEnded } from '../stores/sessionSlice'
import { useAppDispatch } from './redux'

export function useLogout() {
  const [logout, state] = authApi.useLogoutMutation()
  const dispatch = useAppDispatch()
  const { message } = App.useApp()
  return {
    loading: state.isLoading,
    logout: async () => {
      try {
        await logout().unwrap()
      } catch {
        void message.warning(
          'Локальный вход завершён. Не удалось подтвердить выход на сервере.'
        )
      } finally {
        dispatch(sessionEnded())
      }
    }
  }
}
