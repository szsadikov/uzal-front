import { Link } from 'react-router-dom'
import classNames from 'classnames'
import { Tech } from '@/@types/tech.types'
import { Button, Card, CardProps } from '@/components/ui'
import { API_SERVER_URL } from '@/constants/api.constant'
import { formatPrice } from '@/utils/format'
import useAuth from '@/utils/hooks/useAuth'
import useDarkMode from '@/utils/hooks/useDarkmode'
import { useTranslation } from 'react-i18next'

type Props = CardProps & {
	tech: Tech
}

const CatalogCard = ({ tech, className, ...props }: Props) => {
	const [isDark] = useDarkMode()
	const { authenticated } = useAuth()
	const { t } = useTranslation()

	return (
		<Card
			className={classNames(
				'flex flex-col transition duration-150 ease-in-out hover:shadow-lg dark:border dark:border-solid dark:border-gray-600',
				className
			)}
			header={
				tech.files.length ? (
					<img
						src={API_SERVER_URL + tech.files[0].file}
						alt={tech.model_name_ru}
						className='object-cover'
					/>
				) : (
					<img
						src={isDark ? '/img/others/upload-dark.png' : '/img/others/upload.png'}
						alt='no-photo'
						className='max-h-[190px] object-contain'
					/>
				)
			}
			footer={
				<Link to={authenticated ? `/lessee/catalog/${tech.id}` : `/client/${tech.id}`}>
					<Button block size='sm' variant='solid'>
						{t('Подробнее')}
					</Button>
				</Link>
			}
			headerClass='flex flex-col justify-center items-center min-h-[160px] md:min-h-[190px] max-h-[160px] md:max-h-[190px] rounded-tl-[inherit] rounded-tr-[inherit] overflow-hidden p-0'
			bodyClass='p-2 md:p-5'
			footerClass='px-2 py-2 md:px-5 md:py-3 mt-auto'
			headerBorder={false}
			footerBorder={false}
			{...props}
		>
			<div>{tech.model_name_ru}</div>
			<div className='text-xs mt-1'>{tech.type.name_ru}</div>
			<div className='text-base md:text-lg font-semibold mt-2'>
				<span>{formatPrice(tech.price)}</span>
				<small className='ml-1'>{t('сум')}</small>
			</div>
		</Card>
	)
}

export default CatalogCard
