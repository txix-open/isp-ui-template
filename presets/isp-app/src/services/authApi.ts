import { baseApi } from './baseApi'
import { apiPaths } from '../constants/apiPaths'
import type { LoginInput, Profile, Session } from '../types/auth'

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<Session, LoginInput>({
      query: (body) => ({ url: apiPaths.login, method: 'POST', body })
    }),
    profile: builder.query<Profile, void>({
      query: () => ({ url: apiPaths.profile, method: 'POST', body: {} }),
      providesTags: ['Profile']
    }),
    logout: builder.mutation<void, void>({
      query: () => ({ url: apiPaths.logout, method: 'POST', body: {} })
    })
  })
})
