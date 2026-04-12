import type { User } from './user.types'

export type SignInCredential = {
	username?: string
	password?: string
	pinfl?: string
	eimzo_key?: string
	is_remember?: boolean
}

export type SignInResponse = {
	token: string
	user: User
}

export type SignUpResponse = SignInResponse

export type SignUpCredential = {
	stir: string
	company_name: string
	region: number
	account_number: string
	mfo: string
	bank_details: string
	director_name: string
	address: string
	profile: Pick<User, 'username' | 'phone_number'> & {
		password: string
	}
	is_remember?: boolean
}

export type ForgotPassword = {
	username: string
	phone_number: string
}

export type ResetPassword = {
	username: string
	phone_number: string
	password?: string
	code: string
	password_confirmation?: string
	check: boolean
}
