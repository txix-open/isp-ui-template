import './setup/monaco'
import { setupListeners } from '@reduxjs/toolkit/query'
import { Alert, App } from 'antd'
import dayjs from 'dayjs'
import 'dayjs/locale/ru'
import { AdminBase } from 'isp-admin-ui-kit'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'

import { routes } from './routes'
import { store } from './stores'
import 'antd/dist/reset.css'
import 'react-resizable/css/styles.css'
import 'simplebar-react/dist/simplebar.min.css'
import './styles.scss'

dayjs.locale('ru')
window.AppVersion = APP_VERSION
setupListeners(store.dispatch)
const container = document.getElementById('root')
if (!container) throw new Error('Не найден элемент #root')
createRoot(container).render(
  <Provider store={store}>
    <App>
      {import.meta.env.MODE === 'demo' && (
        <Alert
          className="demo-banner"
          banner
          action={
            <a href={`${import.meta.env.BASE_URL}login`}>
              Сменить демо-аккаунт
            </a>
          }
          title="Демо · Данные в памяти. Вход: editor@example.test или viewer@example.test, пароль demo. Демо не подключается к backend."
        />
      )}
      <AdminBase customRouters={routes} defaultRoutePath="/example-items" />
    </App>
  </Provider>
)
