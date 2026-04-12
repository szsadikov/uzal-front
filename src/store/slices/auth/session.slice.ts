import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { User } from '@/@types/user.types'
import { SLICE_BASE_NAME } from './constants'

export interface SessionState {
	signedIn: boolean
	token: string | null
	user: User
}

const initialState: SessionState = {
	signedIn: false,
	token: null,
	user: {} as User
}

const sessionSlice = createSlice({
	name: `${SLICE_BASE_NAME}/session`,
	initialState,
	reducers: {
		signInSuccess(state, action: PayloadAction<{ token?: string; user: User }>) {
			state.signedIn = true
			if (action.payload.token) state.token = action.payload.token
			state.user = action.payload.user
		},
		signOutSuccess(state) {
			state.signedIn = false
			state.token = null
			state.user = {} as User
		}
	}
})

export const { signInSuccess, signOutSuccess } = sessionSlice.actions
export default sessionSlice.reducer
