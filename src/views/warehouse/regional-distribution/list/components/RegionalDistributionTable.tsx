import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { PaginatedResponse, TableQueries } from '@/@types/common'
import type { Region } from '@/@types/dataset.types'
import { TechDistribution } from '@/@types/tech.types'
import { type ColumnDef, DataTable, type OnSortParam } from '@/components/shared'
import { formatPrice, unitName } from '@/utils/format'

type Props = {
	params: TableQueries
	onPageChange: (page: number) => void
	onSizeChange: (size: number) => void
	onSortingChange: (sort: OnSortParam) => void
	distributions?: PaginatedResponse<TechDistribution[]>
	regions?: Region[]
	isLoading?: boolean
}

const RegionalDistributionTable = ({
	params,
	onPageChange,
	onSizeChange,
	onSortingChange,
	distributions,
	regions,
	isLoading
}: Props) => {
	const { t } = useTranslation()

	const columns: ColumnDef<TechDistribution>[] = useMemo(
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
					<div className='font-semibold' style={{ minWidth: props.column.getSize() - 48 }}>
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
				header: t('Нераспредел'),
				accessorKey: 'tech_undistributed_count',
				size: 160,
				sortable: true,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{formatPrice(props.row.original.tech_undistributed_count)}
					</div>
				)
			},
			{
				header: (props) => {
					const id = Number(props.column.id.match(/^region_(\d+)_count$/)?.[1])
					if (!id || !regions) return
					const region = regions.find((reg) => reg.id === id)
					if (!region) return

					const regionName = t(`regions.${id}`)

					return <div className='text-wrap'>{regionName}</div>
					// return <div className='text-wrap'>{region.name_ru}</div>
				},
				accessorKey: 'region_1_count',
				size: 160,
				sortable: true,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{formatPrice(props.row.original.region_1_count)}
					</div>
				)
			},
			{
				header: (props) => {
					const id = Number(props.column.id.match(/^region_(\d+)_count$/)?.[1])
					if (!id || !regions) return
					const region = regions.find((reg) => reg.id === id)
					if (!region) return

					const regionName = t(`regions.${id}`)

					return <div className='text-wrap'>{regionName}</div>

					// return <div className='text-wrap'>{region.name_ru}</div>
				},
				accessorKey: 'region_2_count',
				size: 160,
				sortable: true,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{formatPrice(props.row.original.region_2_count)}
					</div>
				)
			},
			{
				header: (props) => {
					const id = Number(props.column.id.match(/^region_(\d+)_count$/)?.[1])
					if (!id || !regions) return
					const region = regions.find((reg) => reg.id === id)
					if (!region) return

					const regionName = t(`regions.${id}`)

					return <div className='text-wrap'>{regionName}</div>

					// return <div className='text-wrap'>{region.name_ru}</div>
				},
				accessorKey: 'region_3_count',
				size: 160,
				sortable: true,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{formatPrice(props.row.original.region_3_count)}
					</div>
				)
			},
			{
				header: (props) => {
					const id = Number(props.column.id.match(/^region_(\d+)_count$/)?.[1])
					if (!id || !regions) return
					const region = regions.find((reg) => reg.id === id)
					if (!region) return

					// return <div className='text-wrap'>{region.name_ru}</div>
					const regionName = t(`regions.${id}`)

					return <div className='text-wrap'>{regionName}</div>
				},
				accessorKey: 'region_4_count',
				size: 160,
				sortable: true,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{formatPrice(props.row.original.region_4_count)}
					</div>
				)
			},
			{
				header: (props) => {
					const id = Number(props.column.id.match(/^region_(\d+)_count$/)?.[1])
					if (!id || !regions) return
					const region = regions.find((reg) => reg.id === id)
					if (!region) return

					// return <div className='text-wrap'>{region.name_ru}</div>
					const regionName = t(`regions.${id}`)

					return <div className='text-wrap'>{regionName}</div>
				},
				accessorKey: 'region_5_count',
				size: 160,
				sortable: true,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{formatPrice(props.row.original.region_5_count)}
					</div>
				)
			},
			{
				header: (props) => {
					const id = Number(props.column.id.match(/^region_(\d+)_count$/)?.[1])
					if (!id || !regions) return
					const region = regions.find((reg) => reg.id === id)
					if (!region) return

					// return <div className='text-wrap'>{region.name_ru}</div>
					const regionName = t(`regions.${id}`)

					return <div className='text-wrap'>{regionName}</div>
				},
				accessorKey: 'region_6_count',
				size: 160,
				sortable: true,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{formatPrice(props.row.original.region_6_count)}
					</div>
				)
			},
			{
				header: (props) => {
					const id = Number(props.column.id.match(/^region_(\d+)_count$/)?.[1])
					if (!id || !regions) return
					const region = regions.find((reg) => reg.id === id)
					if (!region) return

					// return <div className='text-wrap'>{region.name_ru}</div>
					const regionName = t(`regions.${id}`)

					return <div className='text-wrap'>{regionName}</div>
				},
				accessorKey: 'region_7_count',
				size: 160,
				sortable: true,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{formatPrice(props.row.original.region_7_count)}
					</div>
				)
			},
			{
				header: (props) => {
					const id = Number(props.column.id.match(/^region_(\d+)_count$/)?.[1])
					if (!id || !regions) return
					const region = regions.find((reg) => reg.id === id)
					if (!region) return

					// return <div className='text-wrap'>{region.name_ru}</div>
					const regionName = t(`regions.${id}`)

					return <div className='text-wrap'>{regionName}</div>
				},
				accessorKey: 'region_8_count',
				size: 160,
				sortable: true,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{formatPrice(props.row.original.region_8_count)}
					</div>
				)
			},
			{
				header: (props) => {
					const id = Number(props.column.id.match(/^region_(\d+)_count$/)?.[1])
					if (!id || !regions) return
					const region = regions.find((reg) => reg.id === id)
					if (!region) return

					// return <div className='text-wrap'>{region.name_ru}</div>
					const regionName = t(`regions.${id}`)

					return <div className='text-wrap'>{regionName}</div>
				},
				accessorKey: 'region_9_count',
				size: 160,
				sortable: true,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{formatPrice(props.row.original.region_9_count)}
					</div>
				)
			},
			{
				header: (props) => {
					const id = Number(props.column.id.match(/^region_(\d+)_count$/)?.[1])
					if (!id || !regions) return
					const region = regions.find((reg) => reg.id === id)
					if (!region) return

					// return <div className='text-wrap'>{region.name_ru}</div>
					const regionName = t(`regions.${id}`)

					return <div className='text-wrap'>{regionName}</div>
				},
				accessorKey: 'region_10_count',
				size: 160,
				sortable: true,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{formatPrice(props.row.original.region_10_count)}
					</div>
				)
			},
			{
				header: (props) => {
					const id = Number(props.column.id.match(/^region_(\d+)_count$/)?.[1])
					if (!id || !regions) return
					const region = regions.find((reg) => reg.id === id)
					if (!region) return

					// return <div className='text-wrap'>{region.name_ru}</div>
					const regionName = t(`regions.${id}`)

					return <div className='text-wrap'>{regionName}</div>
				},
				accessorKey: 'region_11_count',
				size: 160,
				sortable: true,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{formatPrice(props.row.original.region_11_count)}
					</div>
				)
			},
			{
				header: (props) => {
					const id = Number(props.column.id.match(/^region_(\d+)_count$/)?.[1])
					if (!id || !regions) return
					const region = regions.find((reg) => reg.id === id)
					if (!region) return

					// return <div className='text-wrap'>{region.name_ru}</div>
					const regionName = t(`regions.${id}`)

					return <div className='text-wrap'>{regionName}</div>
				},
				accessorKey: 'region_12_count',
				size: 160,
				sortable: true,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{formatPrice(props.row.original.region_12_count)}
					</div>
				)
			},
			{
				header: (props) => {
					const id = Number(props.column.id.match(/^region_(\d+)_count$/)?.[1])
					if (!id || !regions) return
					const region = regions.find((reg) => reg.id === id)
					if (!region) return

					// return <div className='text-wrap'>{region.name_ru}</div>
					const regionName = t(`regions.${id}`)

					return <div className='text-wrap'>{regionName}</div>
				},
				accessorKey: 'region_13_count',
				size: 160,
				sortable: true,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{formatPrice(props.row.original.region_13_count)}
					</div>
				)
			},
			{
				header: (props) => {
					const id = Number(props.column.id.match(/^region_(\d+)_count$/)?.[1])
					if (!id || !regions) return
					const region = regions.find((reg) => reg.id === id)
					if (!region) return

					// return <div className='text-wrap'>{region.name_ru}</div>
					const regionName = t(`regions.${id}`)

					return <div className='text-wrap'>{regionName}</div>
				},
				accessorKey: 'region_14_count',
				size: 160,
				sortable: true,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{formatPrice(props.row.original.region_14_count)}
					</div>
				)
			}
		],
		[distributions, t]
	)

	return (
		<>
			<DataTable
				columns={columns}
				data={distributions?.results || []}
				skeletonAvatarColumns={[0]}
				skeletonAvatarProps={{ className: 'rounded-md' }}
				loading={isLoading}
				pagingData={{
					total: distributions?.count || 0,
					pageIndex: params.page,
					pageSize: params.size
				}}
				onPaginationChange={onPageChange}
				onSelectChange={onSizeChange}
				onSort={onSortingChange}
			/>
		</>
	)
}

export default RegionalDistributionTable
