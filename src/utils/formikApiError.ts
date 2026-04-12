// src/utils/formikApiError.ts
import type { AxiosError } from 'axios'
import type { FormikProps } from 'formik'

type FlatErrors = Record<string, string[]>
export type NormalizedApiErrors = { field: FlatErrors; nonField: string[] }

const isObj = (v: any) => v && typeof v === 'object' && !Array.isArray(v)

/** Recursively flatten any nested error payload into `path -> messages[]` */
function flattenErrors(obj: any, prefix = ''): FlatErrors {
	const out: FlatErrors = {}

	const push = (key: string, val: any) => {
		const arr = Array.isArray(val) ? val : [val]
		const msgs = arr.filter((x) => x != null).map(String)
		if (!msgs.length) return
		out[key] = (out[key] ?? []).concat(msgs)
	}

	if (!isObj(obj)) {
		if (obj != null) push(prefix || '', obj)

		return out
	}

	for (const [k, v] of Object.entries<any>(obj)) {
		// common non-field buckets
		if (['non_field_errors', 'detail', 'message', 'error'].includes(k)) {
			push('', v)
			continue
		}
		const next = prefix ? `${prefix}.${k}` : k
		if (isObj(v)) {
			Object.assign(out, flattenErrors(v, next))
		} else {
			push(next, v)
		}
	}

	return out
}

/** Normalize Axios/server error into field + nonField buckets */
export function normalizeApiErrors(err: unknown): NormalizedApiErrors {
	const data =
		(err as AxiosError<any>)?.response?.data ??
		(err as any)?.data ??
		(err as any)?.message ??
		err

	const flat = flattenErrors(data)

	// ✔ non-field xabarlarni ajratib oling va '' kalitni field-lardan olib tashlang
	const nonField = flat[''] ?? []
	const { ['']: _omit, ...field } = flat

	return { field, nonField }
}

/** Safe getter for Formik values using `a.b[0].c` / `a.b.0.c` paths */
function getIn(obj: any, path: string) {
	if (!path) return undefined
	const parts = path.replace(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean)
	let cur = obj
	for (const p of parts) {
		if (cur == null) return undefined
		cur = cur[p]
	}

	return cur
}

/**
 * Apply normalized API errors to Formik fields.
 * - Tries exact path
 * - Tries alias mapping
 * - Tries removing common wrappers like `profile.` or `data.`
 * - Falls back to the last segment (e.g., `profile.phone_number` -> `phone_number`)
 *
 * Returns number of applied field errors.
 */
export function applyApiErrorsToFormik<T>(
	formik: FormikProps<T>,
	normalized: NormalizedApiErrors,
	opts?: { alias?: Record<string, string> }
) {
	let applied = 0
	for (const [path, msgs] of Object.entries(normalized.field)) {
		const msg = msgs.join(' ')
		const candidates: (string | undefined)[] = [
			path,
			opts?.alias?.[path],
			path.startsWith('profile.') ? path.slice('profile.'.length) : undefined,
			path.startsWith('data.') ? path.slice('data.'.length) : undefined,
			path.replace(/\[(\d+)\]/g, '').split('.').pop(), // last segment
		]

		let target: string | undefined
		for (const c of candidates.filter(Boolean) as string[]) {
			const exists =
				getIn(formik.values as any, c) !== undefined ||
				Object.prototype.hasOwnProperty.call(formik.values as any, c)
			if (exists) {
				target = c
				break
			}
		}

		if (target) {
			formik.setFieldError(target as any, msg)
			applied++
		}
	}

	return applied
}
