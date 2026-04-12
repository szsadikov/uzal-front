import { initReactI18next } from 'react-i18next'
import i18n from 'i18next'
import appConfig from '@/configs/app.config'
import en from './lang/en.json'
import oz from './lang/oz.json'
import ru from './lang/ru.json'
import uz from './lang/uz.json'

const resources = {
	en: {
		translation: en
	},
	ru: {
		translation: ru
	},
	uz: {
		translation: uz
	},
	oz: {
		translation: oz
	}
}

await i18n.use(initReactI18next).init({
	resources,
	fallbackLng: appConfig.locale,
	lng: appConfig.locale,
	interpolation: {
		escapeValue: false
	}
})

export const dateLocales: {
	[key: string]: () => Promise<unknown> // ILocale of dayjs
} = {
	en: () => import('dayjs/locale/en'),
	ru: () => import('dayjs/locale/ru'),
	uz: () => import('dayjs/locale/uz'),
	oz: () => import('dayjs/locale/uz')
}

export default i18n
