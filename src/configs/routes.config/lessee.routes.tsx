import { lazy } from 'react'
import type { Routes } from '@/@types/routes'

export const lesseeRoutes: Routes = [
	{
		key: 'client',
		path: '/client',
		component: lazy(() => import('@/views/catalog/(lessee)/list/CatalogList')),
		authority: []
	},
	{
		key: 'client_view',
		path: '/client/:id',
		component: lazy(() => import('@/views/catalog/(lessee)/view/CatalogView')),
		authority: []
	},
	{
		key: 'client_calculator',
		path: '/client/calculator',
		component: lazy(() => import('@/views/catalog/(lessee)/calculator/CatalogCalculator')),
		authority: []
	},
]
