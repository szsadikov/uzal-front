// src/pages/contracts/components/ContractsTableTools.tsx
import { useTranslation } from 'react-i18next'
import { HiDownload } from 'react-icons/hi'
import dayjs from 'dayjs'
import { ContractMeta } from '@/@types/dataset.types'
import { Skeleton } from '@/components/ui'
import Button from '@/components/ui/Button'
import { exportToExcel } from '@/utils/files'
import { FilterQueries } from '../ContractsList'
import ContractsTableSearch from './ContractsTableSearch'

type Props = {
	search?: string
	onSearch: (value?: string) => void
	filters: FilterQueries
	onFilterSubmit: (filters: FilterQueries) => void
	contracts?: ContractMeta[]
	isLoading: boolean
}

/** ✅ Eksportdan oldin obyektlarni tekislaymiz (flatten) */
const mapContractsForExport = (rows: ContractMeta[] = []) =>
	rows.map((r) => ({
		ID: r?.id ?? '',
		REGION: r?.region?.name_ru ?? '', // <-- obyekt emas, string
		REGION_CODE: r?.region?.region_code ?? '',
		YEAR: (r as any)?.year ?? '', // agar sizda bo‘lsa
		NUMBER: (r as any)?.number ?? '', // agar sizda bo‘lsa
		POSITION: (r as any)?.position ?? '' // agar sizda bo‘lsa
	}))

const ContractsTableTools = ({ search, onSearch, contracts, isLoading }: Props) => {
	const { t } = useTranslation()
	const handleExport = () => {
		const data = mapContractsForExport(contracts || [])
		const fileName = `Договор - ${dayjs(new Date()).format('DD.MM.YYYY_HH-mm-ss')}`
		exportToExcel(data, fileName) // utilingiz shu formatni qabul qiladi
	}

	return (
		<div className='flex flex-col lg:flex-row lg:items-center'>
			<ContractsTableSearch value={search} onChange={onSearch} />

			{isLoading ? (
				<Skeleton className='md:ml-2' width={106} height={36} />
			) : (
				(contracts?.length ?? 0) > 0 && (
					<Button
						className='mb-4 block md:mb-0 md:ml-2 md:inline-block'
						size='sm'
						icon={<HiDownload />}
						onClick={handleExport}
					>
						{t('Экспорт')}
					</Button>
				)
			)}
		</div>
	)
}

export default ContractsTableTools
