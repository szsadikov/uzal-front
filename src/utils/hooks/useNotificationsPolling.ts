import { useEffect, useRef } from 'react'
import { NotificationsService, type WsNotification, type Paginated } from '@/services/notifications.service'

type Opts = {
	intervalVisible?: number   // tab ochiq bo'lsa
	intervalHidden?: number    // tab yashirin bo'lsa
	pageSize?: number
	dedupeBy?: 'id' | 'created_at'   // yangi nima bilan aniqlanadi
	onNew: (n: WsNotification) => void
}

export function useNotificationsPolling(opts: Opts) {
	const {
		intervalVisible = 5000,
		intervalHidden = 45000,
		pageSize = 10,
		dedupeBy = 'id',
		onNew,
	} = opts

	const lastKeyRef = useRef<string | number>(0)
	const timerRef = useRef<any>(null)
	const backoffRef = useRef(0)

	useEffect(() => {

		const pickKey = (n: WsNotification) => (dedupeBy === 'id' ? n.id : n.created_at)

		function maxKey(list: WsNotification[]) {
			if (!list.length) return dedupeBy === 'id' ? 0 : ''
			if (dedupeBy === 'id') {
				return Math.max(...list.map((it) => Number(it.id)))
			}
			// created_at bo‘yicha “eng keyingi”ni oling
			return list.map((it) => String(it.created_at)).reduce((a, b) => (a > b ? a : b))
		}

		async function tick() {
			try {
				const res = await NotificationsService.list<Paginated<WsNotification>>({
					page: 1,
					size: pageSize
				})
				const list = res.data?.results ?? []

				// Yangi xabarlarni aniqlash
				const fresh: WsNotification[] = []
				for (const it of list) {
					const key = pickKey(it)
					if (dedupeBy === 'id') {
						if (Number(key) > Number(lastKeyRef.current)) fresh.push(it)
					} else {
						if (String(key) > String(lastKeyRef.current)) fresh.push(it)
					}
				}

				if (fresh.length) {
					// eski→yangi tartib buzilmasin
					fresh.reverse().forEach(onNew)

					// ✅ oxirgi ko‘rilganni to‘g‘ri yangilash: har doim MAX ni oling
					const m = maxKey(list) // yoki maxKey(fresh) ham bo‘ladi, lekin butun list ishonchliroq
					lastKeyRef.current = m
				} else if (list.length) {
					// Birinchi ishga tushganda lastKeyRef bo‘sh bo‘lsa — ham MAX ni qo‘ying
					if (lastKeyRef.current === 0 || lastKeyRef.current === '0' || lastKeyRef.current === '') {
						lastKeyRef.current = maxKey(list)
					}
				}

				backoffRef.current = 0
			} catch (e) {
				backoffRef.current = Math.min((backoffRef.current || 3000) * 2, 30000)
			} finally {
				const base = document.visibilityState === 'visible' ? intervalVisible : intervalHidden
				const wait = base + (backoffRef.current || 0)
				timerRef.current = setTimeout(tick, wait)
			}
		}

		tick()
		const onVis = () => {
			// tab visible bo'lsa darrov yangilab yuboramiz
			if (document.visibilityState === 'visible') {
				clearTimeout(timerRef.current)
				timerRef.current = setTimeout(tick, 200)
			}
		}
		document.addEventListener('visibilitychange', onVis)

		return () => {
			clearTimeout(timerRef.current)
			document.removeEventListener('visibilitychange', onVis)
		}
	}, [intervalVisible, intervalHidden, pageSize, dedupeBy, onNew])
}
