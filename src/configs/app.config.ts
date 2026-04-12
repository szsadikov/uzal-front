export type AppConfig = {
	apiPrefix: string
	authenticatedEntryPath: string
	unAuthenticatedEntryPath: string
	tourPath: string
	locale: string
	enableMock: boolean
}

const appConfig: AppConfig = {
	apiPrefix: '/api/v1',
	authenticatedEntryPath: '/',
	unAuthenticatedEntryPath: '/sign-in',
	tourPath: '/',
	locale: 'ru',
	enableMock: false
}

export default appConfig
