import { combineReducers } from '@reduxjs/toolkit'
import session, { SessionState } from './session.slice'

const reducer = combineReducers({
	session
})

export type AuthState = {
	session: SessionState
}

export * from './session.slice'

export default reducer
