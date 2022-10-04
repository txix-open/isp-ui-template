import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const baseQuery = (
  baseUrl: string,
  customHeaders: { [key: string]: string },
) =>
  fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers) => {
      Object.keys(customHeaders).forEach((key) => {
        headers.set(key, customHeaders[key]);
      });
      return headers;
    },
  });
