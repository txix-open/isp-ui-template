import { combineReducers, configureStore } from '@reduxjs/toolkit';

import { postService } from '../services/PostService';
import userReducer from './reducers/UserSlice';

const rootReducer = combineReducers({
  userReducer,
  [postService.reducerPath]: postService.reducer,
});

export const setupStore = () =>
  configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(postService.middleware),
  });

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore['dispatch'];
