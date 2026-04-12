// src/services/ws.notifications.ts
let ws: WebSocket | null = null
let connecting = false
let tries = 0
let forceClosed = false
let heartbeat: any = null

export type WsInPayload =
	| { id: number; text: string; created_at: string; read_at: string | null; message?: string }
	| { type: string; payload?: any; message?: any; data?: any }

type Handlers = {
	onMessage?: (n: { id: number; text: string; created_at: string; read_at: string | null }) => void
	onOpen?: () => void
	onClose?: () => void
	onError?: (e: Event) => void
}

function getTokenFromApplication(): string {
	try {
		const raw = localStorage.getItem('application')
		if (!raw) return ''
		const root = JSON.parse(raw)
		const auth = root?.auth ? JSON.parse(root.auth) : null
		let t = auth?.session?.token || auth?.token || ''
		if (typeof t === 'string' && t.startsWith('Bearer ')) t = t.slice(7)
		return (t || '').trim()
	} catch {
		return ''
	}
}

function wsUrl(token: string) {
	return `wss://doc-api.uzal.uz/ws/?token=${encodeURIComponent(token)}`
}

function startHeartbeat() {
	stopHeartbeat()
	heartbeat = setInterval(() => {
		try {
			if (ws?.readyState === WebSocket.OPEN) {
				ws.send(JSON.stringify({ type: 'ping' }))
			}
		} catch { /* empty */ }
	}, 25_000)
}

function stopHeartbeat() {
	if (heartbeat) clearInterval(heartbeat)
	heartbeat = null
}

export function connectNotificationsWS(handlers: Handlers, opts?: { token?: string }) {
	const token = opts?.token || getTokenFromApplication()
	if (!token) {

		return () => {}
	}

	// Prevent duplicate connects
	if (ws && ws.readyState === WebSocket.OPEN) {

		return () => {}
	}
	if (connecting) {

		return () => {}
	}

	const url = wsUrl(token)


	connecting = true
	forceClosed = false

	try {
		ws = new WebSocket(url)
	} catch (err) {
		console.error('[WS] Failed to create WebSocket', err)
		connecting = false
		handlers.onError?.(err as any)

		return () => {}
	}

	ws.addEventListener('open', () => {

		connecting = false
		tries = 0
		startHeartbeat()
		handlers.onOpen?.()
	})

	ws.addEventListener('message', (ev) => {


		try {
			const raw = JSON.parse(ev.data) as any

			// Ignore ping/pong messages
			if (raw?.type === 'pong' || raw?.type === 'ping') {

				return
			}

			// Robust payload extraction
			const payload = raw?.payload ?? raw?.message ?? raw?.data ?? raw
			const item = payload?.message ? payload.message : payload

			// Find notification with ID
			const candidate = item && typeof item.id === 'number'
				? item
				: (payload && typeof payload.id === 'number' ? payload : null)

			if (candidate) {

				handlers.onMessage?.(candidate)
			} else {
				console.log('[WS] ⚠️ Unknown payload shape:', raw)
			}
		} catch (err) {
			console.warn('[WS] Parse error:', err)
		}
	})

	ws.addEventListener('error', (e) => {

		handlers.onError?.(e)
	})

	ws.addEventListener('close', (ev) => {

		stopHeartbeat()
		handlers.onClose?.()
		ws = null
		connecting = false

		// Normal close - don't reconnect
		if (forceClosed || ev.code === 1000) {

			return
		}

		// Auth/policy errors - don't reconnect
		const nonReconnectCodes = [4001, 4003]
		if (nonReconnectCodes.includes(ev.code)) {

			return
		}

		// Exponential backoff reconnect
		const base = Math.min(1000 * Math.pow(2, tries), 15000)
		const jitter = Math.floor(Math.random() * 400)
		const timeout = base + jitter

		tries++
		setTimeout(() => connectNotificationsWS(handlers, { token }), timeout)
	})

	return () => {

		forceClosed = true
		stopHeartbeat()
		try { ws?.close() } catch { /* empty */ }
		ws = null
		connecting = false
	}
}
