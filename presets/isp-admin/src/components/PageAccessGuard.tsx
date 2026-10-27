import { Result } from 'antd'
import { useRole } from 'isp-admin-ui-kit'
import type { ReactNode } from 'react'

export function PageAccessGuard({
  permission,
  children
}: {
  permission: string
  children: ReactNode
}) {
  const { hasPermission } = useRole()
  return hasPermission(permission) ? (
    children
  ) : (
    <Result
      status="403"
      title="Нет доступа"
      subTitle="У вас нет прав на просмотр раздела."
    />
  )
}
