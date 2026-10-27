import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Session } from '../types/auth'
import { readSession } from '../utils/session'

interface SessionState {
  current: Session | null
  expired: boolean
}
const initialState: SessionState = { current: readSession(), expired: false }
const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    sessionStarted: (state, action: PayloadAction<Session>) => {
      state.current = action.payload
      state.expired = false
    },
    sessionEnded: (state) => {
      state.current = null
      state.expired = false
    },
    sessionExpired: (state) => {
      state.current = null
      state.expired = true
    }
  }
})
export const { sessionStarted, sessionEnded, sessionExpired } =
  sessionSlice.actions
export const sessionReducer = sessionSlice.reducer
