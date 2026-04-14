import { Navigate, Outlet, useLocation } from 'react-router-dom'
import appConfig from '@/configs/app.config'
import useAuth, { getEntryPathByRole } from '@/utils/hooks/useAuth'

const ProtectedRoute = () => {
	const { authenticated, user } = useAuth()
	const location = useLocation()

	if (!authenticated) {
		return <Navigate to={appConfig.unAuthenticatedEntryPath} replace />
	}

	// Redirect non-admin roles away from root '/' to their role-specific dashboard
	const entryPath = getEntryPathByRole(user?.role || '')
	if (location.pathname === '/' && entryPath !== '/') {
		return <Navigate to={entryPath} replace />
	}

	return <Outlet />
}

export default ProtectedRoute
