import { useEffect, useState } from 'react'

type Method = 'eds' | 'oneid'
type KeyOption = { id: string; label: string }

export default function SignModal({
	open,
	onClose,
	onSubmit,
	keys = []
}: {
	open: boolean
	onClose: () => void
	onSubmit: (p: { method: Method; keyId?: string }) => void
	keys?: KeyOption[]
}) {
	const [method, setMethod] = useState<Method>('oneid')
	const [keyId, setKeyId] = useState<string>('')

	// body scroll-ni bloklash va Escape bilan yopish
	useEffect(() => {
		if (!open) return
		const prev = document.body.style.overflow
		document.body.style.overflow = 'hidden'
		const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
		window.addEventListener('keydown', onEsc)
		return () => {
			document.body.style.overflow = prev
			window.removeEventListener('keydown', onEsc)
		}
	}, [open, onClose])

	if (!open) return null

	const ctaText = method === 'oneid' ? 'Подписать с помощью One ID' : 'Подписать с помощью ЭЦП'

	const canSubmit = method === 'oneid' || (!!keyId && keyId.length > 0)

	const handleSubmit = () => {
		if (!canSubmit) return
		onSubmit({ method, keyId: method === 'eds' ? keyId : undefined })
	}

	return (
		<div
			className='fixed inset-0 z-[100] flex items-center justify-center'
			aria-modal
			role='dialog'
		>
			{/* backdrop (click faqat shu joyda) */}
			<div className='absolute inset-0 bg-black/60' onClick={onClose} />

			{/* panel */}
			<div className='relative z-[101] w-[560px] max-w-[95vw] rounded-2xl bg-white p-6 shadow-2xl'>
				{/* header */}
				<div className='mb-5 flex items-center justify-between'>
					<h3 className='text-[16px] font-semibold'>С помощью чего хотите подписаться?</h3>
					<button
						className='h-8 w-8 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700'
						onClick={onClose}
						aria-label='Закрыть'
						title='Закрыть'
					>
						×
					</button>
				</div>

				{/* segmented control */}
				<div className='mb-6 rounded-xl bg-gray-100 p-1'>
					<div className='grid grid-cols-2 gap-1'>
						<button
							type='button'
							onClick={() => setMethod('eds')}
							className={`h-10 rounded-lg text-[14px] font-medium transition ${
								method === 'eds' ? 'bg-white text-indigo-600 shadow' : 'text-gray-700'
							}`}
						>
							Ключ ЭЦП
						</button>
						<button
							type='button'
							onClick={() => setMethod('oneid')}
							className={`h-10 rounded-lg text-[14px] font-medium transition ${
								method === 'oneid' ? 'bg-white text-indigo-600 shadow' : 'text-gray-700'
							}`}
						>
							One ID
						</button>
					</div>
				</div>

				{/* body: balandlik barqaror (min-h) + unmount qilmaymiz, faqat opacity */}
				<div className='relative mb-5 min-h-[88px]'>
					{/* EDS form */}
					<div
						className={`transition-opacity duration-150 ${
							method === 'eds' ? 'opacity-100' : 'pointer-events-none opacity-0'
						}`}
					>
						<label className='mb-2 block text-sm text-gray-600'>Выберите ключ</label>
						<div className='relative'>
							<select
								value={keyId}
								onChange={(e) => setKeyId(e.target.value)}
								className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition outline-none focus:border-indigo-500'
							>
								<option value=''>Выберите ключ</option>
								{keys.map((k) => (
									<option key={k.id} value={k.id}>
										{k.label}
									</option>
								))}
							</select>
							<span className='pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-400'>
								▾
							</span>
						</div>
					</div>

					{/* OneID bo'lganda bo'sh "placeholder" (heightni ushlab turadi) */}
					<div
						className={`absolute inset-0 transition-opacity duration-150 ${
							method === 'oneid' ? 'opacity-100' : 'pointer-events-none opacity-0'
						}`}
						aria-hidden={method !== 'oneid'}
					/>
				</div>

				{/* footer CTA */}
				<button
					type='button'
					onClick={handleSubmit}
					disabled={!canSubmit}
					className={`h-11 w-full rounded-xl text-[14px] font-semibold text-white transition ${
						canSubmit ? 'bg-indigo-600 hover:bg-indigo-500' : 'cursor-not-allowed bg-indigo-300'
					}`}
				>
					{ctaText}
				</button>
			</div>
		</div>
	)
}
