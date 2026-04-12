/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosError } from 'axios'
import i18n from 'i18next'

// ─── Translate helper — uses i18n instance directly ──────────────────────────
const tr = (key: string): string => {
	const result = i18n.t(key)
	// If key not found, i18next returns the key itself — fallback to raw code
	return result !== key ? result : key
}

// ─── Backend error code → i18n translation key ───────────────────────────────
// Keys must exist in all locale JSON files (ru/uz/oz/en)
const ERROR_CODE_KEY_MAP: Record<string, string> = {
	required:                   'error.required',
	blank:                      'error.blank',
	null:                       'error.null',
	invalid:                    'error.invalid',
	exists:                     'error.exists',
	not_found:                  'error.not_found',
	not_allowed:                'error.not_allowed',
	expired:                    'error.expired',
	not_branch_user:            'error.not_branch_user',
	branch_mismatch:            'error.branch_mismatch',
	region_mismatch:            'error.region_mismatch',
	branch_director_missing:    'error.branch_director_missing',
	payment_record_not_found:   'error.payment_record_not_found',
	not_available:              'error.not_available',
	not_in_stock:               'error.not_in_stock',
	server_error:               'error.server_error',
	min_length:                 'error.min_length',
	max_length:                 'error.max_length',
	min_value:                  'error.min_value',
	max_value:                  'error.max_value',
}

// ─── Types ────────────────────────────────────────────────────────────────────

// Parsed field-level error: { field: 'username', code: 'required', message: '...' }
// Non-field error:          { field: null, code: 'branch_director_missing', message: '...' }
export type ParsedError = {
	field: string | null   // null = non_field_errors
	code: string           // raw error code from backend
	i18nKey: string        // translation key to use with t()
}

export type BackendErrorData = Record<string, string[]>

// ─── Core parser ─────────────────────────────────────────────────────────────

/**
 * Parses DRF-style backend error response into structured ParsedError array.
 *
 * Handles:
 *   { "username": ["required"] }
 *   { "non_field_errors": ["branch_director_missing"] }
 *   { "detail": "some string" }
 */
export function parseBackendErrors(data: unknown): ParsedError[] {
	const results: ParsedError[] = []

	if (!data || typeof data !== 'object') return results

	const obj = data as Record<string, any>

	for (const field of Object.keys(obj)) {
		const value = obj[field]
		const codes: string[] = Array.isArray(value)
			? value.filter((v) => typeof v === 'string')
			: typeof value === 'string'
				? [value]
				: []

		for (const code of codes) {
			const normalizedCode = code.trim()
			const i18nKey = ERROR_CODE_KEY_MAP[normalizedCode] ?? 'error.unknown'
			results.push({
				field: field === 'non_field_errors' ? null : field,
				code: normalizedCode,
				i18nKey,
			})
		}
	}

	return results
}

// ─── getAxiosErrorData ────────────────────────────────────────────────────────

function getAxiosErrorData(error: unknown): unknown {
	if (axios.isAxiosError(error)) {
		return (error as AxiosError<any>).response?.data ?? null
	}
	return null
}

// ─── Main helper: returns translated error message string ─────────────────────
//
// Usage (with react-i18next):
//   const { t } = useTranslation()
//   onError: (err) => toast.push(<Notification title={errorCatch(err, t)} />)
//
// Usage (without t — returns raw code as fallback):
//   onError: (err) => toast.push(<Notification title={errorCatch(err)} />)

export function errorCatch(error: unknown, t?: (key: string) => string): string {
	const translate = t ?? tr
	const data = getAxiosErrorData(error)

	if (data) {
		// 1. Try structured DRF field errors
		if (typeof data === 'object' && !Array.isArray(data)) {
			const parsed = parseBackendErrors(data)
			if (parsed.length > 0) {
				const first = parsed[0]
				const translated = translate(first.i18nKey)
				if (first.field && first.field !== 'non_field_errors') {
					return `${first.field}: ${translated}`
				}
				return translated
			}
		}

		// 2. detail string
		if (typeof (data as any)?.detail === 'string') {
			const detail = (data as any).detail.trim()
			const i18nKey = ERROR_CODE_KEY_MAP[detail]
			if (i18nKey) return translate(i18nKey)
			return detail
		}

		// 3. Plain string response
		if (typeof data === 'string' && data.trim()) return data.trim()
	}

	// 4. Network / JS error
	if (error instanceof Error && error.message) return error.message

	return translate('error.unknown')
}

// ─── Formik setErrors helper ──────────────────────────────────────────────────
//
// Maps backend field errors directly to Formik field errors.
// Usage:
//   onError: (err) => setFormikFieldErrors(err, formikHelpers.setErrors, t)

export function setFormikFieldErrors(
	error: unknown,
	setErrors: (errors: Record<string, string>) => void,
	t?: (key: string) => string
): void {
	const translate = t ?? tr
	const data = getAxiosErrorData(error)
	if (!data || typeof data !== 'object') return

	const parsed = parseBackendErrors(data)
	const fieldErrors: Record<string, string> = {}

	for (const e of parsed) {
		if (e.field) {
			fieldErrors[e.field] = translate(e.i18nKey)
		}
	}

	if (Object.keys(fieldErrors).length > 0) {
		setErrors(fieldErrors)
	}
}

// ─── extractErrorMessages (kept for backward compatibility) ──────────────────

export function extractErrorMessages(error: unknown): string[] {
	if (axios.isAxiosError(error)) {
		const res = (error as AxiosError<any>).response
		const data = res?.data

		if (typeof data === 'string') return [data]
		if (typeof data?.message === 'string' && data.message.trim()) return [data.message]
		if (typeof data?.detail === 'string' && data.detail.trim()) return [data.detail]

		if (Array.isArray(data)) {
			const msgs = data.filter((x) => typeof x === 'string')
			if (msgs.length) return msgs
		}

		if (data && typeof data === 'object') {
			const out: string[] = []
			const walk = (obj: any) => {
				if (Array.isArray(obj)) obj.forEach(walk)
				else if (obj && typeof obj === 'object') Object.values(obj).forEach(walk)
				else if (typeof obj === 'string') out.push(obj)
			}
			walk(data)
			if (out.length) return out
		}

		if (!res) return ['Network error. Please check your connection.']
		if (res.status && res.statusText) return [`${res.status} ${res.statusText}`]
	}

	if (error instanceof Error && error.message) return [error.message]

	return ['Unknown error']
}

export const pickErrorTitle = (e: unknown) => extractErrorMessages(e)[0]
