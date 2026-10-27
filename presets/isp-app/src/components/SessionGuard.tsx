import { Button, Result, Spin } from 'antd'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useProfile } from '../hooks/useProfile'
import { useLogout } from '../hooks/useLogout'

export function SessionGuard() {
  const { session, data, error, isFetching, refetch } = useProfile()
  const { logout, loading } = useLogout()
  const location = useLocation()
  if (!session)
    return (
      <Navigate
        to="/login"
        state={{
          from: `${location.pathname}${location.search}${location.hash}`
        }}
        replace
      />
    )
  if (error)
    return (
      <Result
        status="error"
        title="Не удалось загрузить профиль"
        subTitle="Проверьте соединение и повторите попытку."
        extra={[
          <Button
            key="retry"
            onClick={() => void refetch()}
            loading={isFetching}
          >
            Повторить
          </Button>,
          <Button key="logout" onClick={() => void logout()} loading={loading}>
            Выйти
          </Button>
        ]}
      />
    )
  if (!data)
    return (
      <div className="page-loader">
        <Spin size="large" aria-label="Загрузка профиля" />
      </div>
    )
  return <Outlet />
}
