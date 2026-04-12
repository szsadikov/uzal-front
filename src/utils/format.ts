import 'dayjs/locale/ru'
import 'dayjs/locale/en'

import dayjs, { Dayjs } from 'dayjs'
import duration from 'dayjs/plugin/duration'
import i18n from 'i18next'
import { MeasureUnitEnum } from '@/@types/tech.types'
import { UserRoleEnum, UserRoleTextEnum } from '@/@types/user.types'

dayjs.extend(duration)

dayjs.locale('uz-latin', {
	name: 'uz-latin',
	months: [
		'yanvar',
		'fevral',
		'mart',
		'aprel',
		'may',
		'iyun',
		'iyul',
		'avgust',
		'sentyabr',
		'oktyabr',
		'noyabr',
		'dekabr'
	],
	monthsShort: [
		'yan',
		'fev',
		'mar',
		'apr',
		'may',
		'iyun',
		'iyul',
		'avg',
		'sen',
		'okt',
		'noy',
		'dek'
	],
	weekdays: ['yakshanba', 'dushanba', 'seshanba', 'chorshanba', 'payshanba', 'juma', 'shanba'],
	weekdaysShort: ['yak', 'du', 'se', 'chor', 'pay', 'ju', 'sha'],
	weekdaysMin: ['ya', 'du', 'se', 'ch', 'pa', 'ju', 'sh'],
	weekStart: 1,
	formats: {
		LT: 'HH:mm',
		LTS: 'HH:mm:ss',
		L: 'DD.MM.YYYY',
		LL: 'D MMMM YYYY',
		LLL: 'D MMMM YYYY HH:mm',
		LLLL: 'dddd, D MMMM YYYY HH:mm'
	}
})

export const formatPhone = (phone: string | number) => {
	if (typeof phone !== 'string') return 'Invalid phone number'

	const digits = String(phone).replace(/\D/g, '')

	if (!digits.startsWith('998') || digits.length !== 12) {
		return 'Invalid phone number'
	}

	const code = '+998'
	const part1 = digits.slice(3, 5)
	const part2 = digits.slice(5, 8)
	const part3 = digits.slice(8, 10)
	const part4 = digits.slice(10, 12)

	return `${code} ${part1} ${part2} ${part3} ${part4}`
}

export const trimPhoneNumber = (phone: string | number) => {
	const str = String(phone).replace(/\D/g, '')

	if (str.startsWith('998')) {
		return str.slice(3)
	}

	return str
}

export const formatPrice = (amount: string | number, fractions = 0) => {
	const numeric = typeof amount === 'string' ? parseFloat(amount) : amount

	if (isNaN(numeric)) return 'Invalid amount'

	const integerPart = fractions ? numeric : Math.floor(numeric)

	return integerPart
		.toFixed(fractions)
		.toString()
		.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

export const formatDate = (
	date: Date | Dayjs | string,
	format = 'DD.MM.YYYY',
	locale: 'uz' | 'uz-latin' | 'ru' | 'en' = 'en'
) => {
	return dayjs(date).locale(locale).format(format)
}

export const formatMonths = (months: number) => {
	const lastDigit = months % 10
	const lastTwoDigits = months % 100

	if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
		return `${months} ${i18n.t('месяцев')}`
	}

	if (lastDigit === 1) {
		return `${months} ${i18n.t('месяц')}`
	}

	if (lastDigit >= 2 && lastDigit <= 4) {
		return `${months} ${i18n.t('месяца')}`
	}

	return `${months} ${i18n.t('месяцев')}`
}

export const userRoleTextToName = (role: UserRoleTextEnum) => {
	switch (role) {
		case UserRoleTextEnum.SUPERADMIN:
			return i18n.t('Супер администратор')
		case UserRoleTextEnum.ADMIN:
			return i18n.t('Администратор')
		case UserRoleTextEnum.MARKETING:
			return i18n.t('Маркетолог')
		case UserRoleTextEnum.SALES:
			return i18n.t('Продажник')
		case UserRoleTextEnum.MONITORING:
			return i18n.t('Мониторинг')
		case UserRoleTextEnum.JURIST:
			return i18n.t('Юрист')
		case UserRoleTextEnum.ACCOUNTANT:
			return i18n.t('Бухгалтер')
		case UserRoleTextEnum.FINANCE:
			return i18n.t('Финансист')
		case UserRoleTextEnum.UZMASHLIZING:
			return i18n.t('Узмашлизинг')
		case UserRoleTextEnum.ZAMPRED:
			return i18n.t('Зампед')
		case UserRoleTextEnum.ZAMPREDMONITORING:
			return i18n.t('Зампед мониторинг')
		case UserRoleTextEnum.EXPEDITOR:
			return i18n.t('Экспедитор')
		case UserRoleTextEnum.BRANCH_ACCOUNTANT:
			return i18n.t('Филиал бухгалтер')
		case UserRoleTextEnum.BRANCH_MAIN_ACCOUNTANT:
			return i18n.t('Филиал главный бухгалтер')
		case UserRoleTextEnum.BRANCH_DIRECTOR:
			return i18n.t('Филиал директор')
		case UserRoleTextEnum.BRANCH_ZAMDIRECTOR:
			return i18n.t('Филиал замдиректор')
		case UserRoleTextEnum.BRANCH_SPECIALIST_LIZING_OPERATIONS:
			return i18n.t('Филиал специалист лизинговых операций')
		case UserRoleTextEnum.BRANCH_JURIST:
			return i18n.t('Филиал юрист')
		case UserRoleTextEnum.LESSEE:
			return i18n.t('Лизингополучатель')
	}
}

export const userRoleNumToText = (role: UserRoleEnum) => {
	switch (role) {
		case UserRoleEnum.SUPERADMIN:
			return UserRoleTextEnum.SUPERADMIN
		case UserRoleEnum.ADMIN:
			return UserRoleTextEnum.ADMIN
		case UserRoleEnum.MARKETING:
			return UserRoleTextEnum.MARKETING
		case UserRoleEnum.SALES:
			return UserRoleTextEnum.SALES
		case UserRoleEnum.MONITORING:
			return UserRoleTextEnum.MONITORING
		case UserRoleEnum.JURIST:
			return UserRoleTextEnum.JURIST
		case UserRoleEnum.ACCOUNTANT:
			return UserRoleTextEnum.ACCOUNTANT
		case UserRoleEnum.FINANCE:
			return UserRoleTextEnum.FINANCE
		case UserRoleEnum.UZMASHLIZING:
			return UserRoleTextEnum.UZMASHLIZING
		case UserRoleEnum.ZAMPRED:
			return UserRoleTextEnum.ZAMPRED
		case UserRoleEnum.ZAMPREDMONITORING:
			return UserRoleTextEnum.ZAMPREDMONITORING
		case UserRoleEnum.EXPEDITOR:
			return UserRoleTextEnum.EXPEDITOR
		case UserRoleEnum.BRANCH_ACCOUNTANT:
			return UserRoleTextEnum.BRANCH_ACCOUNTANT
		case UserRoleEnum.BRANCH_MAIN_ACCOUNTANT:
			return UserRoleTextEnum.BRANCH_MAIN_ACCOUNTANT
		case UserRoleEnum.BRANCH_DIRECTOR:
			return UserRoleTextEnum.BRANCH_DIRECTOR
		case UserRoleEnum.BRANCH_ZAMDIRECTOR:
			return UserRoleTextEnum.BRANCH_ZAMDIRECTOR
		case UserRoleEnum.BRANCH_SPECIALIST_LIZING_OPERATIONS:
			return UserRoleTextEnum.BRANCH_SPECIALIST_LIZING_OPERATIONS
		case UserRoleEnum.BRANCH_JURIST:
			return UserRoleTextEnum.BRANCH_JURIST
		case UserRoleEnum.LESSEE:
			return UserRoleTextEnum.LESSEE
	}
}

export const unitName = (unit: MeasureUnitEnum) => {
	switch (unit) {
		case MeasureUnitEnum.PIECES:
			return 'шт.'
	}
}

export const numToWordUz = (input: number | string) => {
	if (input === null || input === undefined || input === '') return ''

	let number: number

	if (typeof input === 'string') {
		const n = Number(input.replace(/,/g, ''))
		if (!Number.isFinite(n)) return 'noto‘g‘ri raqam'
		number = n
	} else {
		number = input
	}

	if (!Number.isFinite(number)) return 'noto‘g‘ri raqam'
	if (number === 0) return 'nol'

	const units: string[] = [
		'',
		'bir',
		'ikki',
		'uch',
		'to‘rt',
		'besh',
		'olti',
		'yetti',
		'sakkiz',
		'to‘qqiz'
	]
	const teens: string[] = [
		'o‘n',
		'o‘n bir',
		'o‘n ikki',
		'o‘n uch',
		'o‘n to‘rt',
		'o‘n besh',
		'o‘n olti',
		'o‘n yetti',
		'o‘n sakkiz',
		'o‘n to‘qqiz'
	]
	const tens: string[] = [
		'',
		'',
		'yigirma',
		'o‘ttiz',
		'qirq',
		'ellik',
		'oltmish',
		'yetmish',
		'sakson',
		'to‘qson'
	]
	const scales: string[] = ['', 'ming', 'million', 'milliard', 'trillion']

	const chunkNumber = (n: number) => {
		const chunks: number[] = []

		while (n > 0) {
			chunks.push(n % 1000)
			n = Math.floor(n / 1000)
		}

		return chunks
	}

	const threeDigitToWords = (num: number) => {
		const words: string[] = []
		const yuz = Math.floor(num / 100)
		const rest = num % 100

		if (yuz) words.push(units[yuz], 'yuz')

		if (rest >= 10 && rest < 20) {
			words.push(teens[rest - 10])
		} else {
			const onlik = Math.floor(rest / 10)
			const birlik = rest % 10
			if (onlik) words.push(tens[onlik])
			if (birlik) words.push(units[birlik])
		}

		return words.join(' ')
	}

	const sign = number < 0 ? 'minus ' : ''
	number = Math.abs(number)

	const integerPart = Math.floor(number)
	const fracPart = String(number).includes('.') ? String(number).split('.')[1] : null

	const chunks = chunkNumber(integerPart)
	const wordsParts: string[] = []

	for (let i = chunks.length - 1; i >= 0; i--) {
		const chunk = chunks[i]
		if (chunk === 0) continue
		const chunkWords = threeDigitToWords(chunk)
		const scale = scales[i] || ''
		wordsParts.push(chunkWords + (scale ? ' ' + scale : ''))
	}

	const integerWords = wordsParts.length ? wordsParts.join(' ') : 'nol'

	let fractionalWords = ''
	if (fracPart != null && Number(fracPart) !== 0) {
		const digits = fracPart.split('')
		fractionalWords = ' nuqta ' + digits.map((d) => units[Number(d)] || 'nol').join(' ')
	}

	return (sign + integerWords + fractionalWords).trim()
}
