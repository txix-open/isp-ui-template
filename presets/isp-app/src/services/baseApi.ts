import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError
} from '@reduxjs/toolkit/query/react'
import { appConfig } from '../config'
import { sessionExpired } from '../stores/sessionSlice'
import { readSession } from '../utils/session'
import { apiPaths } from '../constants/apiPaths'

const rawQuery = fetchBaseQuery({
  baseUrl: `${import.meta.env.BASE_URL}api/`,
  timeout: 15000,
  prepareHeaders(headers) {
    if (appConfig.token) headers.set('X-APPLICATION-TOKEN', appConfig.token)
    const session = readSession()
    if (session) headers.set(session.headerName, session.token)
    return headers
  }
})

const baseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, options) => {
  const requestedSession = readSession()
  const result = await rawQuery(args, api, options)
  const url = typeof args === 'string' ? args : args.url
  // 403 не завершает сессию. Запоздавший 401 старой сессии не сбрасывает новый вход.
  if (
    result.error?.status === 401 &&
    url !== apiPaths.login &&
    requestedSession !== null &&
    requestedSession?.token === readSession()?.token
  ) {
    api.dispatch(sessionExpired())
  }
  return result
}

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['Profile', 'Items'],
  refetchOnReconnect: true,
  endpoints: () => ({})
})
