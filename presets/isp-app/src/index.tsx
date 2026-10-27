import { setupListeners } from '@reduxjs/toolkit/query'
import { Alert, App, ConfigProvider } from 'antd'
import ruRu from 'antd/locale/ru_RU'
import dayjs from 'dayjs'
import 'dayjs/locale/ru'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { RouterProvider } from 'react-router-dom'
import { appConfig } from './config'
import { themeConfig } from './config/theme'
import { router } from './routes'
import { store } from './stores'
import 'antd/dist/reset.css'
import './styles.scss'

window.AppVersion = APP_VERSION
document.title = appConfig.name
dayjs.locale('ru')
setupListeners(store.dispatch)
const container = document.getElementById('root')
if (!container) throw new Error('Не найден элемент #root')
createRoot(container).render(
  <Provider store={store}>
    <ConfigProvider locale={ruRu} theme={themeConfig}>
      <App className="app-root">
        {import.meta.env.MODE === 'demo' && (
          <Alert
            className="demo-banner"
            banner
            title="Демо · Данные в памяти. editor@example.test или viewer@example.test, пароль demo. Реальный backend не используется."
          />
        )}
        <RouterProvider router={router} />
      </App>
    </ConfigProvider>
  </Provider>
)
