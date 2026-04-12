import { useEffect, useState } from 'react'
import { loadEimzoScript } from '@/utils/loadEimzoScript'

declare global {
	interface Window {
		EIMZOClient: any
		EIMZO_VERSION: string
	}
}

export interface KeyItem {
	alias: string
	serialNumber: string
	subjectName: string
	validFrom: string
	validTo: string
	tin: string
	type: string // Type maydonini aniq belgilash
	[key: string]: unknown
}

export const useEimzo = () => {
	const [keys, setKeys] = useState<KeyItem[]>([])
	const [loading, setLoading] = useState<boolean>(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		const initEimzo = async () => {
			try {
				await loadEimzoScript()

				const EIMZOClient = window.EIMZOClient

				if (!EIMZOClient) {
					setError('EIMZOClient yuklanmadi')
					setLoading(false)

					return
				}

				await new Promise<void>((resolve, reject) => {
					EIMZOClient.checkVersion(
						(major: string, minor: string) => {
							const installedVersion = parseInt(major) * 100 + parseInt(minor)
							EIMZOClient.NEW_API = installedVersion >= 336
							if (!EIMZOClient.NEW_API) {
								setError("Iltimos, E-IMZO ning yangi versiyasini o'rnating.")
								setLoading(false)
								reject(new Error('Eski versiya'))

								return
							}
							resolve()
						},
						(e: unknown, message: string) => {
							setError(message || 'E-IMZO versiyasini tekshirishda xato')
							setLoading(false)
							reject(e)
						}
					)
				})

				await new Promise<void>((resolve, reject) => {
					EIMZOClient.installApiKeys(
						() => resolve(),
						(e: unknown, message: string) => {
							setError(message || 'API kalitlarini o‘rnatishda xato')
							setLoading(false)
							reject(e)
						}
					)
				})

				const itemIdGen = (item: any, index: number) => `${item.type}-${item.serialNumber}-${index}`
				const itemUiGen = (itemKey: string, vo: any) => ({
					...vo,
					id: itemKey,
					subjectName: vo.CN || vo.serialNumber,
					validFrom: vo.validFrom.toISOString().split('T')[0],
					validTo: vo.validTo.toISOString().split('T')[0],
					tin: vo.TIN || vo.PINFL || '',
					type: vo.type || 'unknown' // Type ni aniq belgilash
				})

				EIMZOClient.listAllUserKeys(
					itemIdGen,
					itemUiGen,
					(keyList: KeyItem[]) => {
						console.log('🔑 Raw keyList:', keyList) // Tekshirish uchun
						if (Array.isArray(keyList)) {
							const uniqueKeys = keyList.filter(
								(key, index, self) =>
									index === self.findIndex((k) => k.serialNumber === key.serialNumber)
							)
							console.log('🔑 Unique keys:', uniqueKeys)
							setKeys(uniqueKeys)
						} else {
							console.warn('EIMZOClient qaytargan maʼlumot array emas:', keyList)
							setError('E-IMZO kalitlar massivi noto‘g‘ri formatda')
						}
						setLoading(false)
					},
					(e: any, message: string) => {
						console.error('EIMZO xato:', message, e)
						setError(message || 'Kalitlarni yuklashda xato')
						setLoading(false)
					}
				)
			} catch (err: any) {
				console.error('EIMZO init error:', err)
				setError(err.message || 'Nomaʼlum xato')
				setLoading(false)
			}
		}

		initEimzo()
	}, [])

	return { keys, loading, error }
}
