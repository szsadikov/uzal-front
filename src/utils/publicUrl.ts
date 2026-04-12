const base = import.meta.env.BASE_URL

export function pub(path: string): string {
	return base + path.replace(/^\//, '')
}
