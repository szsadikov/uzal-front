import { createServer } from 'miragejs'
import appConfig from '@/configs/app.config'
import { signInUserData } from './data/authData'
import { authFakeApi, dashboardFakeApi } from './fakeApi'

const { apiPrefix } = appConfig

export function mockServer({ environment = 'test' }) {
	return createServer({
		environment,
		seeds(server) {
			server.db.loadData({
				signInUserData
			})
		},
		routes() {
			this.urlPrefix = 'https://test-api.uzal.uz'
			this.namespace = apiPrefix
			// Pass through only truly external requests (not our API server)
			this.passthrough((request) => {
				return request.url.startsWith('http') && !request.url.startsWith('https://test-api.uzal.uz')
			})

			authFakeApi(this, '')
			dashboardFakeApi(this, '')
		}
	})
}
