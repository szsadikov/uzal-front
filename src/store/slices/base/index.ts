import { combineReducers } from '@reduxjs/toolkit'
import common, { CommonState } from './common.slice'

const reducer = combineReducers({
	common
})

export type BaseState = {
	common: CommonState
}

export * from './common.slice'

export default reducer
