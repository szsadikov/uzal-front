import { useTranslation } from 'react-i18next'
import { Branch } from '@/@types/dataset.types'
import { type ColumnDef, DataTable } from '@/components/shared'

type Props = {
	branch: Branch
}

const ViewingDataTable = ({ branch }: Props) => {
	const { t } = useTranslation()
	const columns: ColumnDef<Branch>[] = [
		{
			header: t('Название филиала'),
			accessorKey: 'name',
			size: 260,
			enableSorting: false,
			cell: (props) => <div className="font-semibold">{props.row.original.name}</div>
		},
		{
			header: t('Адрес филиала'),
			accessorKey: 'street',
			size: 320,
			enableSorting: false,
			cell: (props) => {
				const { street, house_number, city } = props.row.original

				return (
					<div>
						{street} {house_number} {city?.name_uz}
					</div>
				)
			}
		},
		{
			header: t('Область'),
			accessorKey: 'region',
			size: 220,
			enableSorting: false,
			cell: (props) => <div>{props.row.original.region?.name_uz}</div>
		},
		{
			header: t('Сотрудники'),
			accessorKey: 'branch_users_count',
			size: 150,
			enableSorting: false,
		}
	]

	return (
		<div className="overflow-x-auto shadow-[0_9px_12px_rgba(0,0,0,0.15)]">
			<DataTable
				columns={columns}
				data={[branch]}
				isPagination={false}
				skeletonAvatarColumns={[0]}
				skeletonAvatarProps={{ className: 'rounded-md' }}
			/>
		</div>
	)
}

export default ViewingDataTable
