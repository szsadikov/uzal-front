import { HiArrowLeft } from 'react-icons/hi'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Tech } from '@/@types/tech.types'
import { AdaptableCard } from '@/components/shared'
import { Button, Skeleton } from '@/components/ui'
import { TechService } from '@/services/tech.service'
import useAuth from '@/utils/hooks/useAuth'
import CatalogImages from './components/CatalogImages'
import CatalogInfo from './components/CatalogInfo'
import { useTranslation } from 'react-i18next'

const CatalogView = () => {
	const params = useParams<{ id: string }>()
	const navigate = useNavigate()
	const { authenticated } = useAuth()
	const { t } = useTranslation()

	const { data: tech, isLoading } = useQuery({
		queryKey: ['get tech', params.id],
		queryFn: () => TechService.getById<Tech>(Number(params.id)),
		select: ({ data }) => data
	})

	return (
		<AdaptableCard className='h-full' bodyClass='h-full'>
			<div className='mb-16 items-center justify-between lg:flex'>
				<h3 className='mb-4 flex items-center lg:mb-0'>
					<Button
						shape='circle'
						variant='plain'
						size='sm'
						icon={<HiArrowLeft size={24} />}
						onClick={() => navigate(-1)}
						className='mr-4'
					/>
					<span>{t('Каталог')}</span>
				</h3>

				{tech && (
					<Link
						className='mb-4 block md:mb-0 lg:inline-block md:ltr:ml-2'
						to={authenticated ? `/lessee/catalog/calculator?tech_id=${tech.id}` : `/client/calculator?tech_id=${tech.id}`}
					>
						<Button block variant='solid' size='sm'>
							{t('Калькулятор')}
						</Button>
					</Link>
				)}
			</div>

			<div className='flex flex-col xl:grid xl:grid-cols-5 xl:gap-x-12 gap-y-8 xl:gap-y-0'>
				{isLoading ? (
					<div className='xl:col-span-2 flex flex-col gap-y-5'>
						<Skeleton height={294} />
						<div className='flex flex-nowrap items-center gap-x-3'>
							<Skeleton height={71} />
							<Skeleton height={71} />
							<Skeleton height={71} />
							<Skeleton height={71} />
						</div>
					</div>
				) : (
					tech && <CatalogImages className='xl:col-span-2' files={tech.files} />
				)}

				{isLoading ? (
					<div className='xl:col-span-3 flex flex-col'>
						<Skeleton width='40%' height={28} className='mb-4' />
						<Skeleton width='25%' height={28} />
						<div className='my-8'>
							<Skeleton width='80%' height={16} className='my-1' />
							<Skeleton width='90%' height={16} className='my-1' />
							<Skeleton width='60%' height={16} className='my-1' />
						</div>
						<div className='flex flex-col gap-y-3'>
							<div className='grid grid-cols-5 gap-4'>
								<Skeleton height={21} className='col-span-2' />
								<Skeleton height={21} className='col-span-3' />
							</div>
							<div className='grid grid-cols-5 gap-4'>
								<Skeleton height={21} className='col-span-2' />
								<Skeleton height={21} className='col-span-3' />
							</div>
							<div className='grid grid-cols-5 gap-4'>
								<Skeleton height={21} className='col-span-2' />
								<Skeleton height={21} className='col-span-3' />
							</div>
							<div className='grid grid-cols-5 gap-4'>
								<Skeleton height={21} className='col-span-2' />
								<Skeleton height={21} className='col-span-3' />
							</div>
							<div className='grid grid-cols-5 gap-4'>
								<Skeleton height={21} className='col-span-2' />
								<Skeleton height={21} className='col-span-3' />
							</div>
							<div className='grid grid-cols-5 gap-4'>
								<Skeleton height={21} className='col-span-2' />
								<Skeleton height={21} className='col-span-3' />
							</div>
						</div>

						<Skeleton width='40%' height={36} className='mt-12 rounded-[8px]' />
					</div>
				) : (
					tech && <CatalogInfo className='xl:col-span-3' tech={tech} />
				)}
			</div>
		</AdaptableCard>
	)
}

export default CatalogView
