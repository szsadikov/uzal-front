import { LAYOUT_TYPE_BLANK } from '@/constants/theme.constant'
import { useAppSelector } from '@/store'
import View from '@/views'
import Side from './Side'

const AuthLayout = () => {
	const layoutType = useAppSelector((state) => state.theme.layout.type)

	return (
		<div className='app-layout-blank flex h-[100vh] flex-auto flex-col'>
			{layoutType === LAYOUT_TYPE_BLANK ? (
				<View />
			) : (
				<Side>
					<View />
				</Side>
			)}
		</div>
	)
}

export default AuthLayout
