import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import App from './components/App'

import { appConfig } from './utils/configUtils'

window.AppVersion = APP_VERSION
document.title = appConfig.name
const container = document.getElementById('root')
if (!container) throw new Error('Не найден элемент #root')
createRoot(container).render(
  <BrowserRouter basename={import.meta.env.BASE_URL}>
    <App />
  </BrowserRouter>
)
