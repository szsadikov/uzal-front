import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { ConstMetric } from '@/@types/dataset.types'
import { AdaptableCard } from '@/components/shared'
import { DatasetService } from '@/services/dataset.service'
import Table from './components/Table'

const AdvanceList = () => {
	const { t } = useTranslation()
	const constMetricId = 1

	const { data: constMetric, isLoading } = useQuery({
		queryKey: ['const_metric', constMetricId],
		queryFn: () => DatasetService.getConstMetricById<ConstMetric>(constMetricId),
		select: (res) => res.data
	})

	return (
		<AdaptableCard className='h-full' bodyClass='h-full'>
			<div className='mb-4 items-center justify-between lg:flex'>
				<h3 className='mb-4 lg:mb-0'>{t('Талабнома')}</h3>
			</div>

			<Table constMetric={constMetric} isLoading={isLoading} />
		</AdaptableCard>
	)
}

export default AdvanceList
