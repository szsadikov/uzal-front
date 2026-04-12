import { CSSProperties, ReactNode } from 'react'

export interface CommonProps {
	className?: string
	children?: ReactNode
	style?: CSSProperties
}

export type TableQueries<T = unknown> = {
	search?: string
	page: number
	size: number
	// count?: number
	// sort?: {
	// 	order: 'asc' | 'desc' | ''
	// 	key: keyof T | string | number
	// }
	ordering?: `${'-' | '+'}${keyof T & string}` | string
	isAll?: boolean
}

export type PaginatedResponse<T> = {
	count: number
	next?: string | null
	next_page_number?: number | null
	page_number?: number | null
	page_size?: number | null
	previous?: string | null
	results: T
}

export type FileType = {
	id: number
	file: string
	file_name?: string
	file_size?: number
	file_type?: string
	is_previewable?: boolean
	preview_type?: 'text' | 'image' | 'pdf'
	preview_url?: string
}
