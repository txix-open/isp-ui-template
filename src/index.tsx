import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'

import App from './components/App'
import { setupStore } from './store'

window.AppVersion = '1.0.1' // запись версии в window

const container: HTMLElement | null = document.getElementById('root')

if (container) {
  const root = createRoot(container)
  const store = setupStore()

  root.render(
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  )
} else {
  console.error('Unable to find root container element')
}
