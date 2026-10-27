import { Result } from 'antd'
import type { ReactNode } from 'react'
import { useProfile } from '../hooks/useProfile'
export function PageAccessGuard({
  permission,
  children
}: {
  permission: string
  children: ReactNode
}) {
  const { can } = useProfile()
  return can(permission) ? (
    children
  ) : (
    <Result
      status="403"
      title="Нет доступа"
      subTitle="У вас нет права на просмотр этого раздела."
    />
  )
}
