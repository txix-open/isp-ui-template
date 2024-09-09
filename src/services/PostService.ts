import { createApi } from '@reduxjs/toolkit/dist/query'

import { customHeaders } from '../constants/headers'
import { baseQuery } from '../utils/apiUtils'

type IPost = {
  id: string
}

export const postService = createApi({
  reducerPath: 'posts',
  tagTypes: ['Post'],
  baseQuery: baseQuery('/api', customHeaders),
  endpoints: (build) => ({
    fetchAll: build.query<IPost[], number>({
      query: (limit = 5) => ({
        url: '/posts',
        params: { _limit: limit }
      }),
      providesTags: () => ['Post']
    }),
    create: build.mutation<IPost, IPost>({
      query: (post) => ({
        url: '/posts',
        method: 'POST',
        body: post
      }),
      invalidatesTags: () => ['Post']
    }),
    update: build.mutation<IPost, IPost>({
      query: (post) => ({
        url: `/posts/${post.id}`,
        method: 'PUT',
        body: post
      }),
      invalidatesTags: ['Post']
    }),
    remove: build.mutation<IPost, IPost>({
      query: (post) => ({
        url: `/posts/${post.id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Post']
    })
  })
})
