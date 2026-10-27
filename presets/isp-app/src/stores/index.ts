import { configureStore, type Middleware } from '@reduxjs/toolkit'
import { baseApi } from '../services/baseApi'
import {
  sessionReducer,
  sessionStarted,
  sessionEnded,
  sessionExpired
} from './sessionSlice'
import { writeSession } from '../utils/session'

const sessionMiddleware: Middleware = (api) => (next) => (action) => {
  // Хранение должно завершиться до публикации нового состояния сессии.
  if (sessionStarted.match(action)) writeSession(action.payload)
  if (sessionEnded.match(action) || sessionExpired.match(action))
    writeSession(null)
  const result = next(action)
  if (sessionStarted.match(action)) {
    api.dispatch(baseApi.util.resetApiState())
  }
  if (sessionEnded.match(action) || sessionExpired.match(action)) {
    api.dispatch(baseApi.util.resetApiState())
  }
  return result
}

export const store = configureStore({
  reducer: { session: sessionReducer, [baseApi.reducerPath]: baseApi.reducer },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(sessionMiddleware, baseApi.middleware)
})
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
