import { Link, Route, Routes } from 'react-router-dom'

import HomePage from '../pages/HomePage/HomePage'
import './App.scss'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route
        path="*"
        element={
          <main>
            <h1>Страница не найдена</h1>
            <Link to="/">На главную</Link>
          </main>
        }
      />
    </Routes>
  )
}
