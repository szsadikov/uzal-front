// src/utils/loadEimzoScript.ts
export const loadEimzoScript = (): Promise<void> => {
	return new Promise((resolve, reject) => {
		const addScript = (src: string): Promise<void> => {
			return new Promise((res, rej) => {
				const script = document.createElement('script')
				script.src = src
				script.onload = () => res()
				script.onerror = (e) => {
					console.error(`❌ Script load error: ${src}`, e)
					rej(e)
				}
				document.body.appendChild(script)
			})
		}

		addScript('/e-imzo/e-imzo.js')
			.then(() => {
				return addScript('/e-imzo/e-imzo-client.js')
			})
			.then(() => {
				resolve()
			})
			.catch((err) => {
				reject(err)
			})
	})
}
