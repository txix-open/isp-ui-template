import { baseApi } from './baseApi'
import { apiPaths } from '../constants/apiPaths'

export type ItemStatus = 'active' | 'archived'
export interface ItemInput {
  name: string
  status: ItemStatus
}
export interface Item extends ItemInput {
  id: string
}
export interface ListParams {
  search: string
  status: ItemStatus | ''
  page: number
  pageSize: number
  order: 'asc' | 'desc'
}
export interface ItemList {
  items: Item[]
  total: number
}

export const itemsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    list: builder.query<ItemList, ListParams>({
      query: (body) => ({
        url: `${apiPaths.items}/list`,
        method: 'POST',
        body
      }),
      providesTags: ['Items']
    }),
    create: builder.mutation<Item, ItemInput>({
      query: (body) => ({
        url: `${apiPaths.items}/create`,
        method: 'POST',
        body
      }),
      invalidatesTags: ['Items']
    }),
    update: builder.mutation<Item, Item>({
      query: (body) => ({
        url: `${apiPaths.items}/update`,
        method: 'POST',
        body
      }),
      invalidatesTags: ['Items']
    }),
    remove: builder.mutation<void, string>({
      query: (id) => ({
        url: `${apiPaths.items}/delete`,
        method: 'POST',
        body: { id }
      }),
      invalidatesTags: ['Items']
    })
  })
})
