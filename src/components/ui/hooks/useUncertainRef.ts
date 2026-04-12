import type { ForwardedRef } from 'react'
import { useRef } from 'react'

export default function useUncertainRef<T = unknown>(ref: ForwardedRef<T>) {
	const newRef = useRef<T>(null)

	if (ref) {
		return ref
	}

	return newRef
}
