import { Alert, Button, Card, Form, Input, Typography } from 'antd'
import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { appConfig } from '../../config'
import { authApi } from '../../services/authApi'
import { sessionStarted } from '../../stores/sessionSlice'
import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import { isSession, safeReturnPath } from '../../utils/access'
import { getApiErrorMessage } from '../../utils/apiError'
import type { LoginInput } from '../../types/auth'

export default function LoginPage() {
  const [login, state] = authApi.useLoginMutation()
  const [error, setError] = useState('')
  const session = useAppSelector((state) => state.session.current)
  const expired = useAppSelector((state) => state.session.expired)
  const dispatch = useAppDispatch()
  const location = useLocation()
  const navigate = useNavigate()
  const from: unknown =
    location.state &&
    typeof location.state === 'object' &&
    'from' in location.state
      ? location.state.from
      : '/'
  const target = safeReturnPath(from)
  if (session)
    return <Navigate to={target === '/login' ? '/' : target} replace />
  return (
    <main className="login-page">
      <Card className="login-card">
        <Typography.Title level={2}>Вход в {appConfig.name}</Typography.Title>
        <Typography.Paragraph type="secondary">
          Войдите, чтобы продолжить работу.
        </Typography.Paragraph>
        {expired && (
          <Alert type="warning" title="Сессия завершена. Войдите повторно." />
        )}
        {error && <Alert type="error" title={error} role="alert" />}
        <Form<LoginInput>
          layout="vertical"
          onFinish={async (input) => {
            setError('')
            try {
              const value = await login(input).unwrap()
              if (!isSession(value))
                throw new Error('Некорректный ответ авторизации')
              dispatch(sessionStarted(value))
              navigate(target === '/login' ? '/' : target, { replace: true })
            } catch (cause) {
              setError(getApiErrorMessage(cause))
            }
          }}
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Введите email' },
              { type: 'email', message: 'Проверьте email' }
            ]}
          >
            <Input autoComplete="username" disabled={state.isLoading} />
          </Form.Item>
          <Form.Item
            label="Пароль"
            name="password"
            rules={[{ required: true, message: 'Введите пароль' }]}
          >
            <Input.Password
              autoComplete="current-password"
              disabled={state.isLoading}
            />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={state.isLoading}
            block
          >
            Войти
          </Button>
        </Form>
      </Card>
    </main>
  )
}
