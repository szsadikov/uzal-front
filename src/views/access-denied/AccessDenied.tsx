import { Container, DoubleSidedImage } from '@/components/shared'
import { pub } from '@/utils/publicUrl'

const AccessDenied = () => {
	return (
		<Container className='h-full'>
			<div className='flex h-full flex-col items-center justify-center'>
				<DoubleSidedImage
					src={pub('/img/others/img-2.png')}
					darkModeSrc={pub('/img/others/img-2-dark.png')}
					alt='Access Denied!'
				/>
				<div className='mt-6 text-center'>
					<h3 className='mb-2'>Доступ запрещен!!</h3>
					<p className='text-base'>У вас нет разрешения на посещение этой страницы</p>
				</div>
			</div>
		</Container>
	)
}

export default AccessDenied
