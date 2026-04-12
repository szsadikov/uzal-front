import type { ChangeEvent, CSSProperties, ForwardedRef } from 'react'
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
	CellContext,
	Column,
	ColumnDef as TanstackColumnDef,
	ColumnSort,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getSortedRowModel,
	Row,
	useReactTable
} from '@tanstack/react-table'
import classNames from 'classnames'
import type { CheckboxProps } from '@/components/ui/Checkbox'
import Checkbox from '@/components/ui/Checkbox'
import Pagination from '@/components/ui/Pagination'
import Select from '@/components/ui/Select'
import type { SkeletonProps } from '@/components/ui/Skeleton'
import Table from '@/components/ui/Table'
import TableRowSkeleton from './loaders/TableRowSkeleton'
import Loading from './Loading'

export type OnSortParam = { order: 'asc' | 'desc' | ''; key: string | number }

export type ColumnMeta = {
	thClassName?: string
	tdClassName?: string
	thStyle?: CSSProperties
	tdStyle?: CSSProperties
}

export type ColumnDef<TData, TValue = unknown> = TanstackColumnDef<TData, TValue> & {
	meta?: ColumnMeta
	sortable?: boolean
	authority?: string[]
}

type DataTableProps<T> = {
	columns: ColumnDef<T>[]
	userRole?: string
	data?: T[]
	loading?: boolean
	onCheckBoxChange?: (checked: boolean, row: T) => void
	onIndeterminateCheckBoxChange?: (checked: boolean, rows: Row<T>[]) => void
	onPaginationChange?: (page: number) => void
	onSelectChange?: (num: number) => void
	onSort?: (sort: OnSortParam) => void
	pageSizes?: number[]
	selectable?: boolean
	skeletonAvatarColumns?: number[]
	skeletonAvatarProps?: SkeletonProps
	pagingData?: {
		total: number
		pageIndex: number
		pageSize: number
	}
	isPagination?: boolean
}

type CheckBoxChangeEvent = ChangeEvent<HTMLInputElement>

interface IndeterminateCheckboxProps extends Omit<CheckboxProps, 'onChange'> {
	onChange: (event: CheckBoxChangeEvent) => void
	indeterminate: boolean
	onCheckBoxChange?: (event: CheckBoxChangeEvent) => void
	onIndeterminateCheckBoxChange?: (event: CheckBoxChangeEvent) => void
}

const { Tr, Th, Td, THead, TBody, Sorter } = Table

const IndeterminateCheckbox = (props: IndeterminateCheckboxProps) => {
	const { indeterminate, onChange, onCheckBoxChange, onIndeterminateCheckBoxChange, ...rest } =
		props
	const ref = useRef<HTMLInputElement>(null)

	useEffect(() => {
		if (ref.current) {
			ref.current.indeterminate = !rest.checked && indeterminate
		}
	}, [ref, indeterminate, rest.checked])

	const handleChange = (e: CheckBoxChangeEvent) => {
		onChange(e)
		onCheckBoxChange?.(e)
		onIndeterminateCheckBoxChange?.(e)
	}

	return <Checkbox ref={ref} className='mb-0' onChange={(_, e) => handleChange(e)} {...rest} />
}

export type DataTableResetHandle = { resetSorting: () => void; resetSelected: () => void }

function DataTableComponent<T>(props: DataTableProps<T>, ref: ForwardedRef<DataTableResetHandle>) {
	const {
		skeletonAvatarColumns,
		columns: columnsProp = [],
		userRole,
		data = [],
		loading = false,
		onCheckBoxChange,
		onIndeterminateCheckBoxChange,
		onPaginationChange,
		onSelectChange,
		onSort,
		pageSizes = [10, 25, 50, 100],
		selectable = false,
		skeletonAvatarProps,
		pagingData = { total: 0, pageIndex: 1, pageSize: 10 },
		isPagination = true
	} = props

	const { pageSize, pageIndex, total } = pagingData
	const [sorting, setSorting] = useState<ColumnSort[]>([])

	const pageCount = useMemo(
		() => Math.max(1, Math.ceil((total || 0) / (pageSize || 1))),
		[total, pageSize]
	)

	const effectivePageSizes = useMemo(() => {
		const base = pageSizes.filter((n) => n <= Math.max(total, 1))
		if (!base.includes(pageSize)) base.push(pageSize)
		const unique = Array.from(new Set(base)).sort((a, b) => a - b)

		return unique.length ? unique : [pageSize]
	}, [pageSizes, total, pageSize])

	const { t } = useTranslation()

	const pageSizeOption = useMemo(
		() => effectivePageSizes.map((n) => ({ value: n, label: `${n} / ${t('page')}` })),
		[effectivePageSizes]
	)

	const handleCheckBoxChange = (checked: boolean, row: T) => {
		if (!loading) onCheckBoxChange?.(checked, row)
	}

	const handleIndeterminateCheckBoxChange = (checked: boolean, rows: Row<T>[]) => {
		if (!loading) onIndeterminateCheckBoxChange?.(checked, rows)
	}

	const handlePaginationChange = (page: number) => {
		if (!loading) onPaginationChange?.(page)
	}

	const handleSelectChange = (value?: number) => {
		if (!loading && value) {
			const newSize = Number(value)
			onSelectChange?.(newSize)
			const newPageCount = Math.max(1, Math.ceil((total || 0) / newSize))
			if (pageIndex > newPageCount) onPaginationChange?.(newPageCount)
		}
	}

	useEffect(() => {
		if (!loading && pageIndex > pageCount && onPaginationChange) {
			onPaginationChange(pageCount)
		}
	}, [loading, pageIndex, pageCount])

	useEffect(() => {
		if (Array.isArray(sorting) && onSort) {
			const sortOrder = sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : ''
			const id = sorting.length > 0 ? sorting[0].id : ''
			onSort({ order: sortOrder, key: id })
		}
	}, [sorting])

	const finalColumns: ColumnDef<T>[] = useMemo(() => {
		const filteredColumns = !userRole
			? columnsProp
			: columnsProp.filter((col) => {
					if (!col.authority) return true

					// обрабатываем отрицательные правила (например '!admin')
					const negativeRules = col.authority.filter((a) => a.startsWith('!'))
					if (negativeRules.length > 0) {
						const excludedRoles = negativeRules.map((a) => a.slice(1).toLowerCase())

						return !excludedRoles.includes(userRole.toLowerCase())
					}

					// обрабатываем обычные роли
					return col.authority.map((a) => a.toLowerCase()).includes(userRole.toLowerCase())
				})

		if (!selectable) return filteredColumns

		return [
			{
				id: 'select',
				header: ({ table }) => (
					<IndeterminateCheckbox
						checked={table.getIsAllRowsSelected()}
						indeterminate={table.getIsSomeRowsSelected()}
						onChange={table.getToggleAllRowsSelectedHandler()}
						onIndeterminateCheckBoxChange={(e) =>
							handleIndeterminateCheckBoxChange(e.target.checked, table.getRowModel().rows)
						}
					/>
				),
				cell: ({ row }) => (
					<IndeterminateCheckbox
						checked={row.getIsSelected()}
						disabled={!row.getCanSelect()}
						indeterminate={row.getIsSomeSelected()}
						onChange={row.getToggleSelectedHandler()}
						onCheckBoxChange={(e) => handleCheckBoxChange(e.target.checked, row.original)}
					/>
				)
			} as ColumnDef<T>,
			...filteredColumns
		]
	}, [columnsProp, selectable, userRole])

	const table = useReactTable<T>({
		data,
		columns: finalColumns,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getSortedRowModel: getSortedRowModel(),
		manualPagination: true,
		manualSorting: true,
		onSortingChange: setSorting,
		state: { sorting }
	})

	const resetSorting = () => table.resetSorting()
	const resetSelected = () => table.toggleAllRowsSelected(false)

	useImperativeHandle(ref, () => ({ resetSorting, resetSelected }))

	const getColMeta = (col: Column<T, unknown>): ColumnMeta => {
		return (col.columnDef.meta as ColumnMeta | undefined) || {}
	}

	return (
		<Loading loading={loading && data.length !== 0} type='cover' className='flex grow flex-col'>
			<Table>
				<THead>
					{table.getHeaderGroups().map((headerGroup) => (
						<Tr key={headerGroup.id}>
							{headerGroup.headers.map((header) => {
								const m = getColMeta(header.column)

								return (
									<Th
										key={header.id}
										colSpan={header.colSpan}
										className={classNames(m.thClassName)}
										style={m.thStyle}
									>
										{header.isPlaceholder ? null : (
											<div
												className={classNames(
													'text-nowrap',
													header.column.getCanSort() &&
														'point flex cursor-pointer flex-nowrap items-center select-none',
													loading && 'pointer-events-none'
												)}
												onClick={header.column.getToggleSortingHandler()}
											>
												{flexRender(header.column.columnDef.header, header.getContext())}
												{header.column.getCanSort() && (
													<Sorter sort={header.column.getIsSorted()} />
												)}
											</div>
										)}
									</Th>
								)
							})}
						</Tr>
					))}
				</THead>

				{loading && data.length === 0 ? (
					<TableRowSkeleton
						columns={finalColumns.length}
						rows={pagingData.pageSize}
						avatarInColumns={skeletonAvatarColumns}
						avatarProps={skeletonAvatarProps}
					/>
				) : (
					<TBody>
						{table.getRowModel().rows.map((row) => (
							<Tr key={row.id}>
								{row.getVisibleCells().map((cell) => {
									const m = getColMeta(cell.column)

									return (
										<Td key={cell.id} className={classNames(m.tdClassName)} style={m.tdStyle}>
											{flexRender(cell.column.columnDef.cell, cell.getContext())}
										</Td>
									)
								})}
							</Tr>
						))}
					</TBody>
				)}
			</Table>

			{isPagination && (
				<div className='mt-4 flex items-center justify-between'>
					<Pagination
						pageSize={pageSize}
						currentPage={pageIndex}
						total={total}
						onChange={handlePaginationChange}
					/>
					<div style={{ minWidth: 130 }}>
						<Select
							size='sm'
							menuPlacement='top'
							isSearchable={false}
							value={pageSizeOption.find((option) => option.value === pageSize)}
							options={pageSizeOption}
							onChange={(option) => handleSelectChange(option?.value)}
						/>
					</div>
				</div>
			)}
		</Loading>
	)
}

const DataTable = forwardRef(DataTableComponent) as <T>(
	props: DataTableProps<T> & { ref?: ForwardedRef<DataTableResetHandle> }
) => ReturnType<typeof DataTableComponent>

export type { CellContext, Row }
export default DataTable
