import { Action, configureStore, Reducer, Store, UnknownAction } from '@reduxjs/toolkit'
import {
	FLUSH,
	PAUSE,
	PERSIST,
	persistReducer,
	persistStore,
	PURGE,
	REGISTER,
	REHYDRATE
} from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { PERSIST_STORE_NAME } from '@/constants/app.constant'
import { RtkQueryService } from '@/services/rtk-query.service'
import { loadAuthData } from '@/utils/auth.utils'
import rootReducer, { AsyncReducers, RootState } from './rootReducer'
// ✅ Document #5 bo'yicha export qilingan
import { signInSuccess } from './slices/auth'

/* eslint-disable @typescript-eslint/no-explicit-any */
const middlewares: any[] = [RtkQueryService.middleware]

const persistConfig = {
	key: PERSIST_STORE_NAME,
	keyPrefix: '',
	storage,
	// ✅ Faqat shu qatorni o'zgartiring - 'auth' ni o'chiring
	whitelist: ['theme', 'locale'] // auth endi persist qilinmaydi
}

interface CustomStore extends Store<RootState, UnknownAction> {
	asyncReducers?: AsyncReducers
}

const store: CustomStore = configureStore({
	reducer: persistReducer(persistConfig, rootReducer() as Reducer),
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			immutableCheck: false,
			serializableCheck: {
				ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
			}
		}).concat(middlewares),
	devTools: process.env.NODE_ENV === 'development'
})

store.asyncReducers = {}

export const persistor = persistStore(store)

// ✅ Sahifa yuklanganda auth ma'lumotlarini yuklash
const authData = loadAuthData()
if (authData && authData.token && authData.user) {
	store.dispatch(signInSuccess({ token: authData.token, user: authData.user }))
}

export function injectReducer<S>(key: string, reducer: Reducer<S, Action>) {
	if (store.asyncReducers) {
		if (store.asyncReducers[key]) {
			return false
		}
		store.asyncReducers[key] = reducer
		store.replaceReducer(persistReducer(persistConfig, rootReducer(store.asyncReducers) as Reducer))
	}
	persistor.persist()

	return store
}

export type AppDispatch = typeof store.dispatch

export default store
