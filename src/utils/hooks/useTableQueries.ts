import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { TableQueries } from '@/@types/common'

export function useTableQueries<T = unknown>(defaults: Partial<TableQueries<T>>) {
	const navigate = useNavigate()
	const { search } = useLocation()
	const searchParams = useMemo(() => new URLSearchParams(search), [search])

	const [queries, setQueries] = useState<TableQueries<T>>(() => ({
		page: Number(searchParams.get('page')) || defaults?.page || 1,
		size: Number(searchParams.get('size')) || defaults?.size || 10,
		search: searchParams.get('search') || defaults?.search,
		isAll: searchParams.has('isAll')
			? searchParams.get('isAll') === 'true'
			: defaults?.isAll,
		ordering: (searchParams.get('ordering') as TableQueries<T>['ordering'])
			|| defaults?.ordering,
	}))

	useEffect(() => {
		const sp = new URLSearchParams()

		sp.set('page', String(queries.page))
		sp.set('size', String(queries.size))

		if (queries.search) sp.set('search', queries.search)
		if (queries.isAll !== undefined) sp.set('isAll', String(queries.isAll))
		if (queries.ordering) sp.set('ordering', queries.ordering)

		navigate({ search: sp.toString() }, { replace: true })
	}, [queries, navigate])

	return { queries, setQueries }
}
