import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { HiOutlineSearch, HiPlusCircle } from 'react-icons/hi'
import { Button, Input } from '@/components/ui'
import JuristContactsAddDrawer from './JuristContactsAddDrawer'

type Props = {
	search?: string
	onSearch: (val?: string) => void
}

const JuristContactsTableTools = ({ search, onSearch }: Props) => {
	const { t } = useTranslation()
	const [isOpen, setIsOpen] = useState(false)

	return (
		<div className='mb-4'>
			<div className='flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between'>
				{/* Search */}
				<div className='w-full min-w-0 lg:max-w-sm lg:flex-1'>
					<Input
						size='sm'
						placeholder={t('Поиск')}
						prefix={<HiOutlineSearch className='text-lg' />}
						value={search ?? ''}
						onChange={(e) => onSearch(e.target.value || undefined)}
					/>
				</div>

				{/* Add button */}
				<div className='flex w-full sm:w-auto'>
					<Button
						variant='solid'
						size='sm'
						icon={<HiPlusCircle />}
						className='w-full sm:w-auto'
						onClick={() => setIsOpen(true)}
					>
						{t('Добавить')}
					</Button>
				</div>
			</div>

			{isOpen && <JuristContactsAddDrawer onClose={() => setIsOpen(false)} />}
		</div>
	)
}

export default JuristContactsTableTools
