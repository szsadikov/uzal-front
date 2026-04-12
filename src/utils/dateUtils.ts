// src/utils/dateUtils.ts

// 'YYYY-MM-DD' → Date (local, TZ siljimasin)
export const fromYMDLocal = (s?: string | null): Date | null => {
	if (!s) return null
	const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s)
	if (!m) return null
	const y = Number(m[1]), mon = Number(m[2]) - 1, d = Number(m[3])
	return new Date(y, mon, d) // local date (00:00, TZsiz)
}

// Date | dayjs | moment | string → 'YYYY-MM-DD'
export const toYMD = (d: any): string | null => {
	if (!d) return null
	if (typeof d?.format === 'function') return d.format('YYYY-MM-DD') // dayjs/moment
	const dt = d instanceof Date ? d : new Date(d)
	if (isNaN(dt.getTime())) return null
	const y = dt.getFullYear()
	const m = String(dt.getMonth() + 1).padStart(2, '0')
	const day = String(dt.getDate()).padStart(2, '0')
	return `${y}-${m}-${day}`
}
