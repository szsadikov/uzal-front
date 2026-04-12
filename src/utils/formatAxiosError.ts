// src/utils/formatAxiosError.ts
import type { AxiosError } from 'axios'

export type NormalizedPart = { field?: string; messages: string[] }
export type Lang = 'uz_cyr' | 'ru'

/** Field label tarjimalari (UI’da ko‘rsatish uchun ixtiyoriy) */
const FIELD_LABELS: Record<Lang, Record<string, string>> = {
	uz_cyr: {
		name: 'Филиал номи',
		region: 'Вилоят',
		city: 'Шаҳар',
		street: 'Кўча',
		house_number: 'Уй рақами',
		username: 'Логин',
		password: 'Парол',
		password_confirmation: 'Паролни тасдиқлаш',
		code: 'Код',
	},
	ru: {
		name: 'Название филиала',
		region: 'Область',
		city: 'Город',
		street: 'Улица',
		house_number: 'Номер дома',
		username: 'Логин',
		password: 'Пароль',
		password_confirmation: 'Подтверждение пароля',
		code: 'Код',
	},
}

/** Xabarlar uchun tarjima / normalizatsiya */
const MSG_MAP: Record<Lang, Record<string, string>> = {
	uz_cyr: {
		'branch with this city already exists.': 'Бу шаҳарда филиал аллақачон мавжуд.',
		'branch with this region already exists.': 'Бу вилоятда филиал аллақачон мавжуд.',
		'new password must be different from your current password':
			'Янги парол жорий паролдан фарқли бўлиши керак.',
		'invalid code': 'Код нотўғри.',
		'code expired': 'Коднинг амал қилиш вақти тугаган.',
	},
	ru: {
		'branch with this city already exists.': 'Филиал в этом городе уже существует.',
		'branch with this region already exists.': 'Филиал в этой области уже существует.',
		'new password must be different from your current password':
			'Новый пароль должен отличаться от текущего.',
		'invalid code': 'Неверный код.',
		'code expired': 'Срок действия кода истёк.',
	},
}

/** Har xil backend formatlarini bitta ko‘rinishga keltiramiz */
function normalizeData(data: any): NormalizedPart[] {
	if (!data) return []
	if (typeof data === 'string') return [{ messages: [data] }]
	if (Array.isArray(data)) return [{ messages: data.map(String) }]

	const parts: NormalizedPart[] = []
	const add = (field: string | undefined, v: any) => {
		if (v == null) return
		if (Array.isArray(v)) parts.push({ field, messages: v.map(String) })
		else if (typeof v === 'object') {
			// { field: { message: '...' } } yoki { errors: { field: [...] } }
			const vs = Object.values(v as any).flat()
			if (vs.length) parts.push({ field, messages: vs.map(String) })
		} else {
			parts.push({ field, messages: [String(v)] })
		}
	}

	for (const [k, v] of Object.entries<any>(data)) {
		if (k === 'errors' && typeof v === 'object') {
			for (const [fk, fv] of Object.entries<any>(v)) add(fk, fv)
		} else if (['non_field_errors', 'detail', 'message', 'error'].includes(k)) {
			add(undefined, v)
		} else {
			add(k, v)
		}
	}

	if (!parts.length) {
		// ayrim hollarda xatolar 1 daraja pastda turadi
		const first = Object.values<any>(data)[0]

		return first ? normalizeData(first) : []
	}

	return parts
}

function mapMessage(msg: string, lang: Lang): string {
	const key = String(msg).trim().toLowerCase()

	return MSG_MAP[lang][key] || (lang === 'uz_cyr' ? 'Хатолик юз берди.' : 'Произошла ошибка.')
}

/** 🔹 Ikki tilda (UZ cyr + RU) ko‘rinadigan matn */
export function formatAxiosErrorDualLang(err: unknown): string {
	const data = (err as AxiosError<any>)?.response?.data ?? (err as any)?.message
	const parts = normalizeData(data)

	if (!parts.length) {
		return 'Хатолик юз берди. Илтимос, қайта уриниб кўринг.\n' +
			'Произошла ошибка. Пожалуйста, попробуйте ещё раз.'
	}

	const lines: string[] = []
	for (const { field, messages } of parts) {
		const uzField = field ? `${FIELD_LABELS.uz_cyr[field] ?? field}: ` : ''
		const ruField = field ? `${FIELD_LABELS.ru[field] ?? field}: ` : ''
		for (const m of messages) {
			const uz = mapMessage(m, 'uz_cyr')
			const ru = mapMessage(m, 'ru')
			lines.push(`${uzField}${uz}\n${ruField}${ru}`)
		}
	}

	return lines.join('\n—\n')
}

/**
 * 🔹 Qisqa bitta xabar: non_field_errors > preferFields > birinchi xabar
 *    (lang default: 'ru' — UI toasti uchun qulay)
 */
export function extractApiMessage(
	err: unknown,
	opts?: { preferFields?: string[]; lang?: Lang }
): string {
	const lang = opts?.lang ?? 'ru'
	const data = (err as AxiosError<any>)?.response?.data ?? (err as any)?.message
	const parts = normalizeData(data)
	if (!parts.length) return lang === 'uz_cyr' ? 'Хатолик юз берди.' : 'Произошла ошибка.'

	const nonField = parts.find(p => !p.field)
	if (nonField?.messages?.length) return mapMessage(nonField.messages[0], lang)

	if (opts?.preferFields?.length) {
		for (const f of opts.preferFields) {
			const p = parts.find(p => p.field === f)
			if (p?.messages?.length) return mapMessage(p.messages[0], lang)
		}
	}

	return mapMessage(parts[0].messages[0], lang)
}

/** 🔹 Formik setErrors uchun: { field: 'xabar' } */
export function toFormErrors(err: unknown, lang: Lang = 'ru'): Record<string, string> {
	const data = (err as AxiosError<any>)?.response?.data ?? (err as any)?.message
	const parts = normalizeData(data)
	const res: Record<string, string> = {}
	for (const { field, messages } of parts) {
		if (!field || !messages?.length) continue
		if (!res[field]) res[field] = mapMessage(messages[0], lang)
	}

	return res
}

/** 🔹 Ma’lum field(lar) bo‘yicha xabar(lar)ni olish */
export function getFieldErrors(err: unknown, field: string, lang: Lang = 'ru'): string[] {
	const data = (err as AxiosError<any>)?.response?.data ?? (err as any)?.message

	return normalizeData(data)
		.filter(p => p.field === field)
		.flatMap(p => p.messages.map(m => mapMessage(m, lang)))
}
