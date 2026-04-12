import { useTranslation } from 'react-i18next'
import { HiDownload, HiOutlineSearch, HiPlusCircle } from 'react-icons/hi'
import { Button, Input } from '@/components/ui'

type Props = {
	search?: string
	onSearch: (val?: string) => void
}

const MarketingClientsTableTools = ({ search, onSearch }: Props) => {
	const { t } = useTranslation()

	return (
		<div className='flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between mb-4'>
			{/* Search */}
			<div className='w-full lg:max-w-sm'>
				<Input
					size='sm'
					placeholder={t('Поиск')}
					prefix={<HiOutlineSearch className='text-lg' />}
					value={search ?? ''}
					onChange={(e) => onSearch(e.target.value || undefined)}
				/>
			</div>

			{/* Actions */}
			<div className='flex flex-wrap items-center gap-2'>
				<Button size='sm' variant='default'>
					{t('Фильтр')}
				</Button>
				<Button size='sm' variant='default'>
					{t('Архив')}
				</Button>
				<Button size='sm' icon={<HiDownload />}>
					{t('Экспорт')}
				</Button>
				<Button size='sm' variant='solid' icon={<HiPlusCircle />}>
					{t('Добавить')}
				</Button>
			</div>
		</div>
	)
}

export default MarketingClientsTableTools
