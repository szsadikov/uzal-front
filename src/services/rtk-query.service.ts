import type { BaseQueryFn } from '@reduxjs/toolkit/query'
import { createApi } from '@reduxjs/toolkit/query/react'
import type { AxiosError, AxiosRequestConfig } from 'axios'
import { apiInstance } from './api.instance'

const axiosBaseQuery =
	(): BaseQueryFn<
		{
			url: string
			method: AxiosRequestConfig['method']
			data?: AxiosRequestConfig['data']
			params?: AxiosRequestConfig['params']
		},
		unknown,
		unknown
	> =>
	async (request) => {
		try {
			const response = apiInstance(request)

			return response
		} catch (axiosError) {
			const err = axiosError as AxiosError

			return {
				error: {
					status: err.response?.status,
					data: err.response?.data || err.message
				}
			}
		}
	}

export const RtkQueryService = createApi({
	reducerPath: 'rtkApi',
	baseQuery: axiosBaseQuery(),
	endpoints: () => ({})
})
