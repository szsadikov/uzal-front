// Мок-учётные записи для локальной разработки.
// Логин: admin      | Пароль: admin      | Роль: admin
// Логин: marketing  | Пароль: qwerty123  | Роль: marketing → /dashboard/marketing
export const signInUserData = [
	{
		id: '21',
		avatar: `${import.meta.env.BASE_URL}img/avatars/thumb-1.jpg`,
		username: 'Carolyn Perkins',
		email: 'carolyn.p@elstar.com',
		authority: ['admin', 'user'],
		password: 'admin',
		accountUserName: 'admin'
	},
	{
		id: '22',
		avatar: `${import.meta.env.BASE_URL}img/avatars/thumb-2.jpg`,
		username: 'Marketing User',
		email: 'marketing@uzmashlizing.uz',
		authority: ['marketing'],
		password: 'qwerty123',
		accountUserName: 'marketing'
	}
]
