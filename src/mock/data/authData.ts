// Мок-учётная запись для локальной разработки.
// Логин: admin | Пароль: admin
// Роль: admin — показывает стандартный набор разделов (Реестр пользователей, Сотрудники, Филиалы, Договор, SMS сервис).
// Не менять role в authFakeApi.ts на 'superadmin' — это ломает навигацию (см. navigation.config/index.ts).
export const signInUserData = [
	{
		id: '21',
		avatar: `${import.meta.env.BASE_URL}img/avatars/thumb-1.jpg`,
		username: 'Carolyn Perkins',
		email: 'carolyn.p@elstar.com',
		authority: ['admin', 'user'],
		password: 'admin',
		accountUserName: 'admin'
	}
]
