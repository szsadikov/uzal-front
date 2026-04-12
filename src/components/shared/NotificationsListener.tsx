// src/components/shared/NotificationsListener.tsx
import { useEffect, useRef } from 'react'
import type { WsNotification } from '@/services/notifications.service'
import { connectNotificationsWS } from '@/services/ws.notifications'

const SEEN_IDS_KEY = 'seen_notifications_ids_v1'
const SEEN_IDS_LIMIT = 200

function loadSeenIds(): Set<string> {
	try {
		const raw = localStorage.getItem(SEEN_IDS_KEY)
		if (!raw) return new Set()
		const arr = JSON.parse(raw) as string[]

		return new Set(arr)
	} catch {
		return new Set()
	}
}

function saveSeenIds(set: Set<string>) {
	try {
		const arr = Array.from(set)
		const trimmed = arr.slice(-SEEN_IDS_LIMIT)
		localStorage.setItem(SEEN_IDS_KEY, JSON.stringify(trimmed))
	} catch {
		// ignore
	}
}

// await Notification.requestPermission()
// console.log('Now:', Notification.permission)

const seenNotificationIds = loadSeenIds()

function emitNew(n: WsNotification) {
	const id = n?.id != null ? String(n.id) : null

	if (id) {
		if (seenNotificationIds.has(id)) {

			return
		}
		seenNotificationIds.add(id)
		saveSeenIds(seenNotificationIds)

	}


	window.dispatchEvent(new CustomEvent('app:new-notification', { detail: n }))
}

export default function NotificationsListener() {
	const havePermissionRef = useRef<boolean>(false)

	useEffect(() => {
		let mounted = true

		async function ensurePermission() {
			try {
				if (!('Notification' in window)) {
					havePermissionRef.current = false
					return
				}
				if (Notification.permission === 'granted') {
					havePermissionRef.current = true
					return
				}
				if (Notification.permission === 'denied') {
					havePermissionRef.current = false
					return
				}
				const p = await Notification.requestPermission()
				if (!mounted) return
				havePermissionRef.current = p === 'granted'

			} catch (err) {

				havePermissionRef.current = false
			}
		}

		ensurePermission()

		return () => {
			mounted = false
		}
	}, [])

	useEffect(() => {

		const disconnect = connectNotificationsWS({
			onOpen: () => {
				console.log('[LISTENER] ✅ WebSocket connected')
			},
			onClose: () => {
				console.log('[LISTENER] 🔌 WebSocket closed')
			},
			onError: (err) => {
				console.error('[LISTENER] ❌ WebSocket error:', err)
			},
			// <-- here we accept any payload and cast to `any` inside to avoid TS errors
			onMessage: (p: any) => {
				console.log('[LISTENER] 📨 Message received from WebSocket:', p)

				// Cast to any because server payload may include fields outside WsNotification
				const payload = p as any

				const n: WsNotification = {
					id: payload.id,
					text: payload.text ?? JSON.stringify(payload),
					created_at: payload.created_at ?? new Date().toISOString(),
					updated_at: null,
					read_at: payload.read_at ?? null
				}

				// original: emit event for app UI & localStorage dedup
				emitNew(n)

				// --- NEW: show system notification (if permission granted) ---
				try {
					const title = (payload.title || payload.messageTitle || 'Yangi xabar') as string
					const body = (payload.message || payload.text || payload.body || '') as string

					if ('Notification' in window && havePermissionRef.current) {
						// eslint-disable-next-line no-undef
						const options: NotificationOptions = {
							body,
							tag: payload.tag,
							data: payload
							// icon: '/icons/notification.png', // agar kerak bo'lsa icon qo'shing
						}
						const notif = new Notification(title, options)
						notif.onclick = () => {
							try {
								window.focus()
							} catch (e) {
								/* ignore */
							}
							// agar payload.url bo'lsa yo'naltirish:
							// if (payload.url) window.location.href = payload.url
						}
					} else {
						// Agar permission bo'lmasa, app ichidagi event (emitNew) orqali UI toast ko'rsatiladi.
						console.log('[LISTENER] toast fallback (no permission):', title, body)
					}
				} catch (err) {
					console.warn('[LISTENER] failed to show Notification, fallback to app toast', err)
				}
			}
		})

		return () => {

			try {
				disconnect()
			} catch {
				/* empty */
			}
		}

	}, [])

	return null
}
