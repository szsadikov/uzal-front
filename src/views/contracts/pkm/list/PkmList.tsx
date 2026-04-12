import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { HiPlusCircle } from 'react-icons/hi'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { PaginatedResponse } from '@/@types/common'
import { PKM } from '@/@types/dataset.types'
import { AdaptableCard } from '@/components/shared'
import { Button, Notification, toast } from '@/components/ui'
import { DatasetService } from '@/services/dataset.service'
import PKMEditDrawer from './components/PKMEditDrawer'
import PKMTable from './components/PKMTable'

const PKMList = () => {
	const { t } = useTranslation()
	const qc = useQueryClient()
	const [page, setPage] = useState(1)
	const [size, setSize] = useState(10)
	const [drawerOpen, setDrawerOpen] = useState(false)
	const [editItem, setEditItem] = useState<PKM | null>(null)

	const params = useMemo(() => ({ page, size }), [page, size])

	const { data, isLoading } = useQuery({
		queryKey: ['pkm_list', params],
		queryFn: () => DatasetService.getPKMList<PaginatedResponse<PKM[]>>(params),
		select: (res) => res.data
	})

	const onAdd = () => {
		setEditItem(null)
		setDrawerOpen(true)
	}
	const onEdit = (row: PKM) => {
		setEditItem(row)
		setDrawerOpen(true)
	}
	const onClose = () => setDrawerOpen(false)

	const onAfterSave = async () => {
		await qc.invalidateQueries({ queryKey: ['pkm_list'] })
		toast.push(<Notification type='success' title={t('Сохранено')} />, { placement: 'top-center' })
		setDrawerOpen(false)
	}

	return (
		<AdaptableCard className='h-full' bodyClass='h-full'>
			<div className='mb-4 flex items-center justify-between'>
				<h3 className='mb-0'>{t('ПКМ')}</h3>

				<div className='flex items-center gap-2'>
					<Button
						variant='solid'
						size='sm'
						className='block md:mb-0 md:inline-block md:ltr:ml-2 md:rtl:mr-2'
						icon={<HiPlusCircle />}
						onClick={onAdd}
					>
						{t('Добавить')}
					</Button>
				</div>
			</div>

			<PKMTable
				data={data?.results || []}
				total={data?.count || 0}
				page={page}
				size={size}
				setPage={setPage}
				setSize={setSize}
				isLoading={isLoading}
				onEdit={onEdit}
			/>

			{drawerOpen && <PKMEditDrawer data={editItem} onClose={onClose} onSaved={onAfterSave} />}
		</AdaptableCard>
	)
}

export default PKMList
