import { Route, Routes } from 'react-router-dom';

import PostContainer from './PostContainer';
import UserContainer from './UserContainer';
import './app.scss';

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<PostContainer />} />
        <Route path="/users" element={<UserContainer />} />
      </Routes>
    </div>
  );
}

export default App;
