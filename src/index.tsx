import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';

import App from './components/App';
import { setupStore } from './store';

// @ts-ignore
window.AppVersion = APP_VERSION; // запись версии в window

const container = document.getElementById('root');
const root = createRoot(container);

const store = setupStore();

root.render(
  <Provider store={store}>
    <App />
  </Provider>,
);
