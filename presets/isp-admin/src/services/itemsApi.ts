import { createApi } from '@reduxjs/toolkit/query/react'
import { axiosBaseQuery } from 'isp-admin-ui-kit'

export interface Item {
  id: string
  name: string
}
export interface ItemInput {
  name: string
}

// Учебный контракт. При подключении backend замените его подтверждённым API.
export const itemsApi = createApi({
  reducerPath: 'itemsApi',
  baseQuery: axiosBaseQuery({
    baseUrl: `${import.meta.env.BASE_URL}api/example/items`
  }),
  tagTypes: ['Items'],
  endpoints: (builder) => ({
    list: builder.query<Item[], void>({
      query: () => ({ url: '/list', method: 'post', data: {} }),
      providesTags: ['Items']
    }),
    create: builder.mutation<Item, ItemInput>({
      query: (data) => ({ url: '/create', method: 'post', data }),
      invalidatesTags: ['Items']
    }),
    update: builder.mutation<Item, Item>({
      query: (data) => ({ url: '/update', method: 'post', data }),
      invalidatesTags: ['Items']
    }),
    remove: builder.mutation<void, string>({
      query: (id) => ({ url: '/delete', method: 'post', data: { id } }),
      invalidatesTags: ['Items']
    })
  })
})
