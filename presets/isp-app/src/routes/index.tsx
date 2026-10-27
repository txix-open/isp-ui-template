import { createBrowserRouter, Link } from 'react-router-dom'
import { Result } from 'antd'
import { SessionGuard } from '../components/SessionGuard'
import { PageAccessGuard } from '../components/PageAccessGuard'
import { AppLayout } from '../layouts/AppLayout'
import { permissions } from '../constants/permissions'
import HomePage from '../pages/HomePage'
import LoginPage from '../pages/LoginPage'
import ItemsPage from '../pages/ItemsPage'

export const router = createBrowserRouter(
  [
    { path: '/login', element: <LoginPage /> },
    {
      element: <SessionGuard />,
      children: [
        {
          element: <AppLayout />,
          children: [
            { index: true, element: <HomePage /> },
            {
              path: '/items',
              element: (
                <PageAccessGuard permission={permissions.view}>
                  <ItemsPage />
                </PageAccessGuard>
              )
            },
            {
              path: '*',
              element: (
                <Result
                  status="404"
                  title="Страница не найдена"
                  extra={<Link to="/">На главную</Link>}
                />
              )
            }
          ]
        }
      ]
    }
  ],
  { basename: import.meta.env.BASE_URL }
)
