// src/utils/localize.ts
export type LangKey = 'ru' | 'uzl' | 'uz'  // uzl = lotin, uz = kirill (moslang)

export function normalizeLang(lang?: string | null): LangKey {
	if (!lang) return 'uz'
	const l = String(lang).toLowerCase()
	// mapping: bu joyni sizning platformangizga qarab sozlang
	// agar siz ilgari aytgandek: 'uz' = LOTIN va 'oz' = KIRILL bo'lsa, moslang
	if (l === 'uz') return 'uzl'   // agar saytda 'uz' lotin uchun ishlatilsa
	if (l === 'oz') return 'uz'    // 'oz' kirill uchun
	if (l === 'uzl' || l.includes('latn')) return 'uzl'
	if (l.startsWith('ru')) return 'ru'
	if (l.startsWith('uz')) return 'uz'

	return 'uz'
}

/**
 * Suffix-first getLocalizedValue:
 * - birinchi navbatda obyektdagi field oxiri (_ru/_uzl/_uz) ga qaraydi
 * - agar topilsa, shu qiymat qaytariladi, bosh qismi qanday bo'lishidan qat'iy nazar
 * - keyin candidates va umumiy maydonlar tekshiriladi
 */
export function getLocalizedValueSuffixFirst(
	obj: Record<string, any> | null | undefined,
	lang?: string | null,
	candidates: string[] = []
): string | null {
	if (!obj) return null
	const L = normalizeLang(lang)

	// suffixlar ustuvorligi (birinchi element — eng yuqori prioritet)
	const suffixPriority: Record<LangKey, string[]> = {
		ru: ['_ru'],
		uzl: ['_uzl', '_uz'],
		uz: ['_uz', '_uzl']
	}

	const suffixes = suffixPriority[L] ?? ['_uz', '_uzl']

	// 1) Suffix-first: ob'ektning barcha kalitlarini tekshiramiz.
	const keys = Object.keys(obj)
	// Avval eng yuqori ustuvor suffix bo'yicha tekshir
	for (const s of suffixes) {
		for (const k of keys) {
			if (k.toLowerCase().endsWith(s)) {
				const v = obj[k]
				if (v != null && String(v).trim() !== '') return String(v).trim()
			}
		}
	}

	// 2) Agar yuqorida topilmasa, agar candidates berilgan bo'lsa ularni tekshir
	for (const f of candidates) {
		const v = obj[f]
		if (v != null && String(v).trim() !== '') return String(v).trim()
	}

	// 3) Umumiy maydonlar
	for (const k of ['name', 'model_name', 'title']) {
		if (obj[k] != null && String(obj[k]).trim() !== '') return String(obj[k]).trim()
	}

	// 4) fallback: id
	if (obj.id != null) return `#${obj.id}`

	return null
}

/**
 * mapToOptions yordamchi: list -> Select options
 */
export type Option = { label: string; value: any }

export function mapToOptionsSuffixFirst(
	list: any[] | null | undefined,
	lang?: string | null,
	opts?: { candidates?: string[]; valueField?: string }
): Option[] {
	if (!Array.isArray(list)) return []
	const valueField = opts?.valueField ?? 'id'
	const candidates = opts?.candidates ?? []

	return list
		.filter((i) => i != null && (i[valueField] != null || i.id != null))
		.map((i) => {
			const label = getLocalizedValueSuffixFirst(i, lang, candidates) ?? ''
			const value = i[valueField] ?? i.id

			return { label, value }
		})
}
