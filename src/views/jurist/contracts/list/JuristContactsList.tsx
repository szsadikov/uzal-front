import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TableQueries } from '@/@types/common'
import { AdaptableCard } from '@/components/shared'
import JuristContactsTable from '../components/JuristContactsTable'
import JuristContactsTableTools from '../components/JuristContactsTableTools'

const JuristContactsList = () => {
	const { t } = useTranslation()
	const [queries, setQueries] = useState<TableQueries>({ page: 1, size: 10 })

	const params = useMemo(() => ({ ...queries }), [queries])

	return (
		<AdaptableCard className='h-full' bodyClass='h-full'>
			{/* Title + Tools — BranchesList kabi bir qatorda */}
			<div className='items-baseline justify-between lg:flex'>
				<h3 className='mb-0 flex align-baseline'>{t('Контакты Юристов')}</h3>
				<JuristContactsTableTools
					search={queries.search as string | undefined}
					onSearch={(val) => setQueries((prev) => ({ ...prev, search: val, page: 1 }))}
				/>
			</div>

			<JuristContactsTable
				params={params}
				onPageChange={(page) => setQueries((prev) => ({ ...prev, page }))}
				onSizeChange={(size) => setQueries((prev) => ({ ...prev, size }))}
				onSortingChange={(sort) => setQueries((prev) => ({ ...prev, sort }))}
			/>
		</AdaptableCard>
	)
}

export default JuristContactsList
