import { lazy } from 'react'
import type { Routes } from '@/@types/routes'

export const authRoutes: Routes = [
	{
		key: 'sign_in',
		path: '/sign-in',
		component: lazy(() => import('@/views/auth/sign-in/SignIn')),
		authority: []
	},
	{
		key: 'sign_up',
		path: `/sign-up`,
		component: lazy(() => import('@/views/auth/sign-up/SignUp')),
		authority: []
	},
	{
		key: 'forgot_password',
		path: '/forgot-password',
		component: lazy(() => import('@/views/auth/forgot-password/ForgotPassword')),
		authority: []
	}
]
