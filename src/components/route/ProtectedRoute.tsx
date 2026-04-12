import { Outlet } from 'react-router-dom'
import appConfig from '@/configs/app.config'
import useAuth from '@/utils/hooks/useAuth'

const ProtectedRoute = () => {
	const { authenticated } = useAuth()

	// return (
	// 	<Navigate
	// 		replace
	// 		to={`${unAuthenticatedEntryPath}?${REDIRECT_URL_KEY}=${location.pathname}`}
	// 	/>
	// )

	if (!authenticated) {
		window.location.href = appConfig.unAuthenticatedEntryPath

		return
	}

	return <Outlet />
}

export default ProtectedRoute
