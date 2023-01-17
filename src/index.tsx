import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import App from './components/App';
import './normalize.scss';
import { setupStore } from './store';

// @ts-ignore
window.AppVersion = APP_VERSION; // запись версии в window

const container = document.getElementById('root');
const root = createRoot(container);

const store = setupStore();

root.render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>,
);
