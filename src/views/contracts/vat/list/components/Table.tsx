// src/pages/branches/components/ConstMetricTable.tsx
import { type CSSProperties, useMemo, useState } from 'react'
import { HiOutlinePencil } from 'react-icons/hi'
import { ConstMetric } from '@/@types/dataset.types'
import { type ColumnDef, DataTable } from '@/components/shared'
import useThemeClass from '@/utils/hooks/useThemeClass'
import EditDrawer from './EditDrawer'
import { useTranslation } from 'react-i18next' // ⬅️ i18n

type Props = {
	constMetric?: ConstMetric | null
	isLoading: boolean
}

const toPercent = (n?: string) =>
	n === undefined || n === null ? '-' : `${String(Number(n)).replace(/\.0+$/, '')}%`

const ActionColumn = ({
	row,
	style,
	onEdit
}: {
	row: ConstMetric
	style?: CSSProperties
	onEdit?: (item: ConstMetric) => void
}) => {
	const { textTheme } = useThemeClass()

	return (
		<div className='justify-left flex text-lg' style={style}>
			<span
				className={`cursor-pointer p-2 hover:${textTheme}`}
				onClick={() => onEdit && onEdit(row)}
			>
				<HiOutlinePencil />
			</span>
		</div>
	)
}

const Table = ({ constMetric, isLoading }: Props) => {
	const { t } = useTranslation() // ⬅️ i18n
	const [editData, setEditData] = useState<ConstMetric | null>(null)

	const rows = constMetric ? [constMetric] : []

	const columns: ColumnDef<ConstMetric>[] = useMemo(
		() => [
			{
				header: 'ID',
				accessorKey: 'id',
				size: 200,
				enableSorting: false,
				sortable: false,
				cell: (props) => (
					<div
						className='text-left font-semibold'
						style={{ minWidth: props.column.getSize() - 48 }}
					>
						{props.row.original.id}
					</div>
				)
			},
			{
				header: t('НДС'),
				accessorKey: 'vat',
				size: 250,
				enableSorting: false,
				cell: (props) => (
					<div
						className='text-left font-semibold'
						style={{ minWidth: props.column.getSize() - 48 }}
					>
						{toPercent(props.row.original.vat)}
					</div>
				)
			},
			{
				header: t('Действие'),
				id: 'actions',
				size: 120,
				enableSorting: false,
				meta: {
					// sticky faqat sm+ ekranlarda bo‘lsin; mobilda oddiy keltiriladi
					thClassName: 'sm:sticky sm:right-0 sm:z-[5]',
					tdClassName: 'sm:sticky sm:right-0',
					thStyle: { textAlign: 'center', width: '80px' },
					tdStyle: { textAlign: 'center', width: '80px' }
				},
				cell: (props) => (
					<ActionColumn
						row={props.row.original}
						style={{ minWidth: props.column.getSize() - 48 }}
						onEdit={(item) => setEditData(item)}
					/>
				)
			}
		],
		[t] // ⬅️ til o‘zgarganda qayta tuziladi
	)

	return (
		<>
			<DataTable
				columns={columns}
				data={rows}
				skeletonAvatarColumns={[0]}
				skeletonAvatarProps={{ className: 'rounded-md' }}
				loading={isLoading}
				isPagination={false}
			/>

			{editData && <EditDrawer data={editData} onClose={() => setEditData(null)} />}
		</>
	)
}

export default Table
