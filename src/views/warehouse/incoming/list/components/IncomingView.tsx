import { Dispatch, SetStateAction, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { HiDownload } from 'react-icons/hi'
import { useQuery } from '@tanstack/react-query'
import { PaginatedResponse } from '@/@types/common'
import { Tech, TechStockOperation, TechStockOperationActionEnum } from '@/@types/tech.types'
import { type ColumnDef, DataTable, OnSortParam } from '@/components/shared'
import { Button, Drawer, Skeleton, Tooltip } from '@/components/ui'
import { TechService } from '@/services/tech.service'
import { exportToExcel } from '@/utils/files'
import { formatDate, formatPrice, unitName } from '@/utils/format'
import useResponsive from '@/utils/hooks/useResponsive'
import { useTableQueries } from '@/utils/hooks/useTableQueries'

type Props = {
	id: number
	isOpen: boolean
	setIsOpen: Dispatch<SetStateAction<boolean>>
}

type FilterQueries = {
	action?: TechStockOperationActionEnum
}

const IncomingView = ({ id, isOpen, setIsOpen }: Props) => {
	const { windowWidth, larger } = useResponsive()
	const { t } = useTranslation()

	const { queries, setQueries } = useTableQueries<TechStockOperation>({ page: 1, size: 10 })
	const [filters] = useState<FilterQueries>({ action: TechStockOperationActionEnum.INCOME })

	const params = useMemo(() => ({ ...queries, ...filters }), [queries, filters])

	const { data: tech, isLoading: isLoadingTech } = useQuery({
		queryKey: ['get tech', id],
		queryFn: () => TechService.getById<Tech>(Number(id)),
		select: ({ data }) => data
	})

	const { data: stocks, isLoading: isLoadingStocks } = useQuery({
		queryKey: ['get stock operations', id, params],
		queryFn: () =>
			TechService.getAllStockOperations<PaginatedResponse<TechStockOperation[]>>({ ...params, tech: id }),
		select: ({ data }) => data
	})


	const techColumns: ColumnDef<Tech>[] = useMemo(
		() => [
			{
				header: '№',
				accessorKey: 'id',
				size: 80,
				enableSorting: false,
				meta: {
					thClassName: 'sticky bg-gray-50 dark:bg-gray-700 left-0 z-1',
					tdClassName: 'sticky bg-white dark:bg-gray-800 left-0 z-1'
				},
				cell: (props) => (
					<div className='font-semibold' style={{ minWidth: props.column.getSize() - 48 }}>
						{props.row.original.id}
					</div>
				)
			},
			{
				header: t('Техника'),
				accessorKey: 'model_name_ru',
				size: 200,
				sortable: true,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{props.row.original.model_name_ru}
					</div>
				)
			},
			{
				header: t('Ед. изм.'),
				accessorKey: 'measure_unit',
				size: 140,
				enableSorting: false,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{unitName(props.row.original.measure_unit)}
					</div>
				)
			},
			{
				header: t('Количество'),
				accessorKey: 'count',
				size: 160,
				sortable: true,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{formatPrice(props.row.original.count)}
					</div>
				)
			},
			{
				header: () => <div className='text-right'>{t('Цена')}</div>,
				accessorKey: 'price',
				size: 160,
				enableSorting: false,
				cell: (props) => (
					<div className='text-right' style={{ minWidth: props.column.getSize() - 48 }}>
						{formatPrice(props.row.original.price)}
					</div>
				)
			},
			{
				header: t('Ндс'),
				accessorKey: 'vat',
				size: 100,
				enableSorting: false,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>{props.row.original.vat}%</div>
				)
			},
			{
				header: () => <div className='text-right'>{t('Цена с НДС')}</div>,
				accessorKey: 'tech_price_with_vat',
				size: 160,
				enableSorting: false,
				cell: (props) => (
					<div className='text-right' style={{ minWidth: props.column.getSize() - 48 }}>
						{formatPrice(props.row.original.tech_price_with_vat)}
					</div>
				)
			},
			{
				header: () => <div className='text-right'>{t('Общ. цена с ндс')}</div>,
				accessorKey: 'overall_price',
				size: 170,
				enableSorting: false,
				cell: (props) => (
					<div className='text-right' style={{ minWidth: props.column.getSize() - 48 }}>
						{formatPrice(props.row.original.count * Number(props.row.original.tech_price_with_vat))}
					</div>
				)
			},
		],
		[tech, t]
	)

	const stocksColumns: ColumnDef<TechStockOperation>[] = useMemo(
		() => [
			{
				header: '№',
				accessorKey: 'id',
				size: 80,
				enableSorting: false,
				meta: {
					thClassName: 'sticky bg-gray-50 dark:bg-gray-700 left-0 z-1',
					tdClassName: 'sticky bg-white dark:bg-gray-800 left-0 z-1'
				},
				cell: (props) => (
					<div className='font-semibold' style={{ minWidth: props.column.getSize() - 48 }}>
						{props.row.original.id}
					</div>
				)
			},
			{
				header: t('Поставщик'),
				accessorKey: 'delivery',
				size: 240,
				sortable: true,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						<Tooltip title={props.row.original.delivery ? props.row.original.delivery : '-'}>
							<span className='truncate-2'>{props.row.original.delivery ? props.row.original.delivery : '-'}</span>
						</Tooltip>
					</div>
				)
			},
			{
				header: t('ИНН'),
				accessorKey: 'stir',
				size: 140,
				enableSorting: false,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{props.row.original.stir ? props.row.original.stir : '-'}
					</div>
				)
			},
			{
				header: t('№Договора'),
				accessorKey: 'invoice',
				size: 140,
				enableSorting: false,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{props.row.original.invoice ? props.row.original.invoice : '-'}
					</div>
				)
			},
			{
				header: t('Количество'),
				accessorKey: 'unit_after_unit_before',
				size: 160,
				sortable: true,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{formatPrice(props.row.original.unit_after - props.row.original.unit_before)}
					</div>
				)
			},
			{
				header: () => <div className='text-right'>{t('Цена')}</div>,
				accessorKey: 'price',
				size: 170,
				enableSorting: false,
				cell: (props) => (
					<div className='text-right' style={{ minWidth: props.column.getSize() - 48 }}>
						{props.row.original.price ? formatPrice(Number(props.row.original.price)) : '-'}
					</div>
				)
			},
			{
				header: t('Ндс'),
				accessorKey: 'vat',
				size: 100,
				sortable: true,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{props.row.original.vat ? `${Number(props.row.original.vat).toFixed(0)}%` : '-'}
					</div>
				)
			},
			{
				header: t('Дата прихода'),
				accessorKey: 'created_at',
				size: 140,
				enableSorting: false,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{formatDate(props.row.original.created_at, 'DD/MM/YYYY HH:mm:ss')}
					</div>
				)
			},
			{
				header: () => <div className='text-right'>{t('Цена с НДС')}</div>,
				accessorKey: 'price_with_vat',
				size: 170,
				enableSorting: false,
				cell: (props) => (
					<div className='text-right' style={{ minWidth: props.column.getSize() - 48 }}>
						{props.row.original.price_with_vat
							? formatPrice(Number(props.row.original.price_with_vat))
							: '-'}
					</div>
				)
			},
			{
				header: () => <div className='text-right'>{t('Общая сумма')}</div>,
				accessorKey: 'overall_price',
				size: 170,
				enableSorting: false,
				cell: (props) => (
					<div className='text-right' style={{ minWidth: props.column.getSize() - 48 }}>
						{props.row.original.overall_price
							? formatPrice(Number(props.row.original.overall_price))
							: '-'}
					</div>
				)
			}
		],
		[stocks, t]
	)

	const onSortingChange = (sort: OnSortParam) => {
		setQueries((prev) => {
			let nextOrdering: string | undefined

			if (sort.key && sort.order) {
				if (sort.order === 'asc') nextOrdering = `${sort.key}`
				else if (sort.order === 'desc') nextOrdering = `-${sort.key}`
			}

			if (prev.ordering === nextOrdering) return prev

			return { ...prev, ordering: nextOrdering }
		})
	}

	const onExportToExel = async () => {
		if (!tech || !stocks || !stocks.results.length) return

		const clearedData = stocks.results.map((item) => ({
			'№': item.id,
			'Поставщик': item.delivery ? item.delivery : '-',
			'ИНН': item.stir,
			'Количество': item.unit_after - item.unit_before,
			'Цена': Number(item.price).toFixed(0),
			'Ндс': Number(item.vat).toFixed(0),
			'Дата прихода': formatDate(item.created_at),
			'Цена с Ндс': Number(item.price_with_vat).toFixed(0),
			'Общая сумма': Number(item.overall_price).toFixed(0)
		}))

		await exportToExcel(
			clearedData,
			`${t('Техника')} - ${tech.model_name_ru} - ${formatDate(new Date(), 'DD.MM.YYYY_HH-mm-ss')}`
		)
	}

	return tech && (
		<Drawer
			title={`${t('Техника')} - ${tech.model_name_ru}`}
			width={larger.lg ? windowWidth - 294 : windowWidth}
			isOpen={isOpen}
			placement='right'
			onClose={() => setIsOpen(false)}
			onRequestClose={() => setIsOpen(false)}
			footer={
				<div className='w-full text-right'>
					<Button variant='solid' className='mr-2' onClick={() => setIsOpen(false)}>
						{t('Закрыть')}
					</Button>
				</div>
			}
		>
			<div className='flex flex-col lg:flex-row lg:items-center lg:justify-end mb-4'>
				{isLoadingStocks ? (
					<Skeleton className='md:ml-2' width={106} height={36} />
				) : (
					<Button
						className='block md:ml-2 md:inline-block'
						size='sm'
						icon={<HiDownload />}
						disabled={!stocks || !stocks.results.length}
						onClick={onExportToExel}
					>
						{t('Экспорт')}
					</Button>
				)}
			</div>

			<div className='shadow-[0_9px_12px_0_rgba(0,0,0,0.15)]'>
				<DataTable
					loading={isLoadingTech}
					columns={techColumns}
					data={[{ ...tech }]}
					skeletonAvatarColumns={[0]}
					skeletonAvatarProps={{ className: 'rounded-md' }}
					isPagination={false}
				/>
			</div>

			<div className='mt-12'>
				<DataTable
					columns={stocksColumns}
					data={stocks?.results || []}
					skeletonAvatarColumns={[0]}
					skeletonAvatarProps={{ className: 'rounded-md' }}
					loading={isLoadingStocks}
					pagingData={{
						total: stocks?.count || 0,
						pageIndex: params.page,
						pageSize: params.size
					}}
					onPaginationChange={(page) => setQueries((prev) => ({ ...prev, page }))}
					onSelectChange={(size) => setQueries((prev) => ({ ...prev, size }))}
					onSort={onSortingChange}
				/>
			</div>
		</Drawer>
	)
}

export default IncomingView
