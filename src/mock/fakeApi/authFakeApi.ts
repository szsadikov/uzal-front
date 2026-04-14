import isEmpty from 'lodash/isEmpty'
import uniqueId from 'lodash/uniqueId'
import { Response, Server } from 'miragejs'

export default function authFakeApi(server: Server, apiPrefix: string) {
	// Real login endpoint used by auth.service.ts
	server.post(`${apiPrefix}/profile/token/`, (schema, { requestBody }) => {
		const body = JSON.parse(requestBody)
		const user = schema.db.signInUserData.findBy({
			accountUserName: body.username,
			password: body.password
		})
		if (user) {
			const isMarketing = user.accountUserName === 'marketing'
			const roleInfo = isMarketing
				? { role: 'marketing', role_id: 3, role_obj: { id: 3, name: 'marketing', name_ru: 'Маркетинг', name_uz: 'Marketing' } }
				: { role: 'admin', role_id: 2, role_obj: { id: 2, name: 'admin', name_ru: 'Администратор', name_uz: 'Administrator' } }

			return {
				token: 'mock-dev-token-abc123',
				user: {
					id: isMarketing ? 22 : 1,
					username: user.accountUserName,
					first_name: isMarketing ? 'Маркетинг' : 'Админ',
					middle_name: '',
					last_name: 'Пользователь',
					phone_number: '+998901234567',
					email: user.email,
					pinfl: '',
					is_active: true,
					profile_picture: '',
					last_login: new Date().toISOString(),
					...roleInfo,
					parent_role_id: roleInfo.role_id,
					procuration_number: 0,
					region: { id: 1, name_ru: 'Ташкентская область', name_uz: 'Toshkent viloyati', region_code: '10' }
				}
			}
		}
		return new Response(401, {}, { detail: 'No active account found with the given credentials' })
	})

	server.post(`${apiPrefix}/sign-in`, (schema, { requestBody }) => {
		const { userName, password } = JSON.parse(requestBody)
		const user = schema.db.signInUserData.findBy({
			accountUserName: userName,
			password
		})
		console.log('user', user)
		if (user) {
			const { avatar, userName, email, authority } = user

			return {
				user: { avatar, userName, email, authority },
				token: 'wVYrxaeNa9OxdnULvde1Au5m5w63'
			}
		}

		return new Response(401, { some: 'header' }, { message: 'Invalid email or password!' })
	})

	server.post(`${apiPrefix}/sign-out`, () => {
		return true
	})

	server.post(`${apiPrefix}/sign-up`, (schema, { requestBody }) => {
		const { userName, password, email } = JSON.parse(requestBody)
		const userExist = schema.db.signInUserData.findBy({
			accountUserName: userName
		})
		const emailUsed = schema.db.signInUserData.findBy({ email })
		const newUser = {
			avatar: `${import.meta.env.BASE_URL}img/avatars/thumb-1.jpg`,
			userName,
			email,
			authority: ['admin', 'user']
		}
		if (!isEmpty(userExist)) {
			const errors = [{ message: '', domain: 'global', reason: 'invalid' }]

			return new Response(400, { some: 'header' }, { errors, message: 'User already exist!' })
		}

		if (!isEmpty(emailUsed)) {
			const errors = [{ message: '', domain: 'global', reason: 'invalid' }]

			return new Response(400, { some: 'header' }, { errors, message: 'Email already used' })
		}

		schema.db.signInUserData.insert({
			...newUser,
			...{ id: uniqueId('user_'), password, accountUserName: userName }
		})

		return {
			user: newUser,
			token: 'wVYrxaeNa9OxdnULvde1Au5m5w63'
		}
	})

	server.post(`${apiPrefix}/forgot-password`, () => {
		return true
	})

	server.post(`${apiPrefix}/reset-password`, () => {
		return true
	})
}
