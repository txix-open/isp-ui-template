import { FC } from 'react'
import { Route, Routes } from 'react-router-dom'

import HomePages from '../pages/HomePage/HomePages'
import './app.scss'

const App = () => {
  // const [create, {}] = postService.useCreateMutation();
  // const [update, {}] = postService.useUpdateMutation();
  // const [remove, {}] = postService.useRemoveMutation();

  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<HomePages />} />
      </Routes>
    </div>
  )
}

export default App
