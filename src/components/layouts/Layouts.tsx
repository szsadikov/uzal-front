import { lazy, Suspense, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import Loading from '@/components/shared/Loading'
import NotificationsListener from '@/components/shared/NotificationsListener'
import {
	LAYOUT_TYPE_BLANK,
	LAYOUT_TYPE_CLASSIC,
	LAYOUT_TYPE_DECKED,
	LAYOUT_TYPE_MODERN,
	LAYOUT_TYPE_SIMPLE,
	LAYOUT_TYPE_STACKED_SIDE
} from '@/constants/theme.constant'
import { useAppSelector } from '@/store'
import useAuth from '@/utils/hooks/useAuth'
import useDirection from '@/utils/hooks/useDirection'
import useLocale from '@/utils/hooks/useLocale'

const layouts = {
	[LAYOUT_TYPE_CLASSIC]: lazy(() => import('./ClassicLayout')),
	[LAYOUT_TYPE_MODERN]: lazy(() => import('./ModernLayout')),
	[LAYOUT_TYPE_STACKED_SIDE]: lazy(() => import('./StackedSideLayout')),
	[LAYOUT_TYPE_SIMPLE]: lazy(() => import('./SimpleLayout')),
	[LAYOUT_TYPE_DECKED]: lazy(() => import('./DeckedLayout')),
	[LAYOUT_TYPE_BLANK]: lazy(() => import('./BlankLayout'))
}

const Layout = () => {
	const layoutType = useAppSelector((state) => state.theme.layout.type)

	const { pathname } = useLocation()
	const { authenticated } = useAuth()

	useDirection()

	useLocale()

	const AppLayout = useMemo(() => {
		if (authenticated || pathname.includes('/client')) {
			return layouts[layoutType]
		}

		return lazy(() => import('./AuthLayout'))
	}, [layoutType, authenticated])

	return (
		<Suspense
			fallback={
				<div className='flex h-[100vh] flex-auto flex-col'>
					<Loading loading={true} />
				</div>
			}
		>
			<NotificationsListener />
			<AppLayout />
		</Suspense>
	)
}

export default Layout
