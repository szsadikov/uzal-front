// src/utils/mixedExport.ts
import * as XLSX from 'xlsx'

export type AnyUser = {
	id?: number | string
	// user ma'lumotlari turli joyda bo‘lishi mumkin: profile ichida yoki userning o‘zida
	profile?: {
		first_name?: string
		last_name?: string
		middle_name?: string
		phone_number?: string
		role?: string | number
		branch?: {
			street?: string
			house_number?: string
			region?: { name_uz?: string; name_ru?: string; region_code?: string | number }
		}
	} | null
	// ba'zi loyihalarda branch yoki region userning o‘zida ham bo‘lishi mumkin
	branch?: {
		street?: string
		house_number?: string
		region?: { name_uz?: string; name_ru?: string; region_code?: string | number }
	} | null
	region?: { name_uz?: string; name_ru?: string; region_code?: string | number } | null
	first_name?: string
	last_name?: string
	middle_name?: string
	phone_number?: string
	role?: string | number
}

export type AnyBranch = {
	id?: number | string
	name?: string
	street?: string
	house_number?: string
	region?: { name_uz?: string; name_ru?: string; region_code?: string | number } | null
	// boshqa maydonlar bo‘lishi mumkin — eksportga ta'sir qilmaydi
	[k: string]: unknown
}

export type ExportMode = 'separate' | 'single'

/** User uchun normalizator (object -> flat row) */
export function normalizeUser(u: AnyUser) {
	const anyU = u as any
	const p = anyU.profile ?? anyU
	const b = anyU.branch ?? anyU.profile?.branch ?? null
	const region = b?.region ?? anyU.region ?? null
	const address = [b?.street, b?.house_number].filter(Boolean).join(' ')

	return {
		TYPE: 'USER',
		ID: anyU.id ?? '',
		FIRST_NAME: p?.first_name ?? '',
		LAST_NAME: p?.last_name ?? '',
		MIDDLE_NAME: p?.middle_name ?? '',
		PHONE_NUMBER: p?.phone_number ?? '',
		ROLE: p?.role ?? '',
		REGION: region?.name_uz ?? region?.name_ru ?? '',
		REGION_CODE: region?.region_code ?? '',
		ADDRESS: address
	}
}

/** Branch uchun normalizator (object -> flat row) */
export function normalizeBranch(b: AnyBranch) {
	const region = b?.region ?? null
	const address = [b?.street, b?.house_number].filter(Boolean).join(' ')
	return {
		TYPE: 'BRANCH',
		ID: b?.id ?? '',
		BRANCH_NAME: b?.name ?? '',
		REGION: region?.name_uz ?? region?.name_ru ?? '',
		REGION_CODE: region?.region_code ?? '',
		ADDRESS: address
	}
}

/** Ikkita typedan Excel’ga eksport */
export function exportMixedToExcel(
	users: AnyUser[] = [],
	branches: AnyBranch[] = [],
	fileName = 'export.xlsx',
	mode: ExportMode = 'separate'
) {
	const wb = XLSX.utils.book_new()

	if (mode === 'separate') {
		// 1) Foydalanuvchilar uchun alohida sheet
		const userRows = users.map(normalizeUser)
		const wsUsers = XLSX.utils.json_to_sheet(userRows)
		XLSX.utils.book_append_sheet(wb, wsUsers, 'Users')

		// 2) Filiallar uchun alohida sheet
		const branchRows = branches.map(normalizeBranch)
		const wsBranches = XLSX.utils.json_to_sheet(branchRows)
		XLSX.utils.book_append_sheet(wb, wsBranches, 'Branches')
	} else {
		// 'single' — bitta sheetga birlashtiramiz (ustun to‘plami umumiy)
		const merged = [
			...users.map(normalizeUser),
			...branches.map((b) => {
				const row = normalizeBranch(b)
				// USER va BRANCH ustunlarini umumiylashtirish:
				return {
					TYPE: row.TYPE,
					ID: row.ID,
					FIRST_NAME: '',     // branchda yo‘q — bo‘sh
					LAST_NAME: '',
					MIDDLE_NAME: '',
					PHONE_NUMBER: '',
					ROLE: '',
					REGION: row.REGION,
					REGION_CODE: row.REGION_CODE,
					ADDRESS: row.ADDRESS,
					BRANCH_NAME: row.BRANCH_NAME
				}
			})
		]
		const ws = XLSX.utils.json_to_sheet(merged)
		XLSX.utils.book_append_sheet(wb, ws, 'All')
	}

	XLSX.writeFile(wb, fileName)
}
