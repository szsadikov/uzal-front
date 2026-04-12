import { Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import type { LayoutType } from '@/@types/theme'
import AppRoute from '@/components/route/AppRoute'
import AuthorityGuard from '@/components/route/AuthorityGuard'
import ProtectedRoute from '@/components/route/ProtectedRoute'
import PublicRoute from '@/components/route/PublicRoute'
import Loading from '@/components/shared/Loading'
import PageContainer from '@/components/template/PageContainer'
import appConfig from '@/configs/app.config'
import { protectedRoutes, publicRoutes } from '@/configs/routes.config'
import { lesseeRoutes } from '@/configs/routes.config/lessee.routes'

// import { useAppSelector } from '@/store'

interface ViewsProps {
	pageContainerType?: 'default' | 'gutterless' | 'contained'
	layout?: LayoutType
}

type AllRoutesProps = ViewsProps

const { authenticatedEntryPath } = appConfig

const AllRoutes = (props: AllRoutesProps) => {
	// const userAuthority = useAppSelector((state) => state.auth.user.authority)

	return (
		<Routes>
			<Route path='/' element={<ProtectedRoute />}>
				{protectedRoutes.map((route, index) => (
					<Route
						key={route.key + index}
						path={route.path}
						element={
							<AuthorityGuard authority={route.authority}>
								<PageContainer {...props} {...route.meta}>
									<AppRoute routeKey={route.key} component={route.component} {...route.meta} />
								</PageContainer>
							</AuthorityGuard>
						}
					/>
				))}
				<Route path='*' element={<Navigate replace to='/' />} />
			</Route>
			<Route path='/' element={<PublicRoute />}>
				{lesseeRoutes.map((route, index) => (
					<Route
						key={route.key + index}
						path={route.path}
						element={
							<PageContainer {...props} {...route.meta}>
								<AppRoute routeKey={route.key} component={route.component} {...route.meta} />
							</PageContainer>
						}
					/>
				))}
				{publicRoutes.map((route) => (
					<Route
						key={route.path}
						path={route.path}
						element={<AppRoute routeKey={route.key} component={route.component} {...route.meta} />}
					/>
				))}
			</Route>
		</Routes>
	)
}

const Views = (props: ViewsProps) => {
	return (
		<Suspense fallback={<Loading loading={true} />}>
			<AllRoutes {...props} />
		</Suspense>
	)
}

export default Views
