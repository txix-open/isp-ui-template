import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import App from '@components/App.tsx'

const container = document.getElementById('root') as HTMLElement
const root = createRoot(container)
const baseUrl = import.meta.env.DEV_PUBLIC_PATH || '/'

root.render(
  <BrowserRouter basename={baseUrl}>
    <App />
  </BrowserRouter>
)
