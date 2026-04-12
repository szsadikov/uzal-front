import { Action, combineReducers, Reducer } from 'redux'
import { RtkQueryService } from '@/services/rtk-query.service'
import auth, { AuthState } from './slices/auth'
import base, { BaseState } from './slices/base'
import locale, { LocaleState } from './slices/locale/locale.slice'
import theme, { ThemeState } from './slices/theme/theme.slice'

export type RootState = {
	auth: AuthState
	base: BaseState
	locale: LocaleState
	theme: ThemeState
	/* eslint-disable @typescript-eslint/no-explicit-any */
	[RtkQueryService.reducerPath]: any
}

export interface AsyncReducers {
	[key: string]: Reducer<any, Action>
}

const staticReducers = {
	auth,
	base,
	locale,
	theme,
	[RtkQueryService.reducerPath]: RtkQueryService.reducer
}

const rootReducer = (asyncReducers?: AsyncReducers) => (state: RootState, action: Action) => {
	const combinedReducer = combineReducers({
		...staticReducers,
		...asyncReducers
	})

	return combinedReducer(state, action)
}

export default rootReducer
