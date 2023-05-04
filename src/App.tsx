import HomePages from '@pages/HomePage/HomePages.tsx';
import { Route, Routes } from 'react-router-dom';

import './App.scss';

window.APP_VERSION = APP_VERSION;

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePages />} />
      </Routes>
    </>
  );
}

export default App;
