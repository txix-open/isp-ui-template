import type { ComponentProps } from 'react'
import { AdminBase } from 'isp-admin-ui-kit'
import { DatabaseOutlined } from '@ant-design/icons'

import { PageAccessGuard } from '../components/PageAccessGuard'
import { permissions } from '../constants/permissions'
import ItemsPage from '../pages/ItemsPage'

export const routes: NonNullable<
  ComponentProps<typeof AdminBase>['customRouters']
> = [
  {
    key: 'example-items',
    label: 'Справочник',
    route: '/example-items',
    permissions: [permissions.view],
    icon: <DatabaseOutlined />,
    element: (
      <PageAccessGuard permission={permissions.view}>
        <ItemsPage />
      </PageAccessGuard>
    )
  }
]
