import { createRoot } from 'react-dom/client';
import App from './components/App';

// @ts-ignore
window.AppVersion = APP_VERSION; // запись версии в window

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
