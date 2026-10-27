import { DatabaseOutlined, HomeOutlined } from '@ant-design/icons'
import type { ConfigMenuItemType } from 'isp-ui-kit'
import { permissions } from '../constants/permissions'

export const navigation: ConfigMenuItemType[] = [
  {
    key: 'home',
    label: 'Главная',
    route: '/',
    permissions: [],
    icon: <HomeOutlined />
  },
  {
    key: 'items',
    label: 'Справочник',
    route: '/items',
    permissions: [permissions.view],
    icon: <DatabaseOutlined />
  }
]
