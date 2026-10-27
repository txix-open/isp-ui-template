import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined
} from '@ant-design/icons'
import { Button, Layout, Space, Typography } from 'antd'
import { LayoutMenu, LayoutSider } from 'isp-ui-kit'
import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { appConfig } from '../config'
import { useProfile } from '../hooks/useProfile'
import { useLogout } from '../hooks/useLogout'
import { navigation } from './navigation'

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(true)
  const { data: profile, can } = useProfile()
  const { logout, loading } = useLogout()
  const location = useLocation()
  const navigate = useNavigate()
  const visible = navigation.filter((item) => can(item.permissions))
  return (
    <Layout className="app-shell">
      <LayoutSider
        width={224}
        collapsedWidth={64}
        collapsed={collapsed}
        trigger={null}
      >
        <div className="app-brand" title={appConfig.name}>
          {collapsed ? 'ISP' : appConfig.name}
        </div>
        <LayoutMenu
          menuConfig={visible}
          currentPath={location.pathname}
          onHideMenuItem={() => false}
          onClickItem={({ key }) => {
            const item = navigation.find((entry) => entry.key === key)
            if (typeof item?.route === 'string') navigate(item.route)
          }}
        />
      </LayoutSider>
      <Layout className="workspace">
        <Layout.Header className="app-header">
          <Space>
            <Button
              aria-label={collapsed ? 'Развернуть меню' : 'Свернуть меню'}
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
            />
            <Typography.Text className="app-title">
              {appConfig.name}
            </Typography.Text>
          </Space>
          <Space>
            <Typography.Text className="profile-name">
              {profile?.displayName}
            </Typography.Text>
            <Button
              aria-label="Выйти"
              icon={<LogoutOutlined />}
              loading={loading}
              onClick={() => void logout()}
            />
          </Space>
        </Layout.Header>
        <Layout.Content className="app-content">
          <Outlet />
        </Layout.Content>
        <Layout.Footer className="app-footer">
          {appConfig.name} · {window.AppVersion}
        </Layout.Footer>
      </Layout>
    </Layout>
  )
}
