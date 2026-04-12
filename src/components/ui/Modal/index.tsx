import { ReactNode, useEffect, useId } from 'react'
import { createPortal } from 'react-dom'
import { HiX } from 'react-icons/hi'

type ModalProps = {
	isOpen: boolean
	onClose: () => void
	title?: ReactNode
	width?: number | string
	children: ReactNode
}

/* ================== UI matnlar (ruscha) ================== */
/* i18n ga o'tkazganda:
   const T = {
     closeAria: t('modal.close'),
     defaultTitle: t('modal.title'),
   }
*/
const T = {
	closeAria: 'Закрыть',
	defaultTitle: 'Диалог',
}

const Modal = ({ isOpen, onClose, title, width = 720, children }: ModalProps) => {
	const titleId = useId()

	useEffect(() => {
		if (!isOpen) return
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose()
		}
		document.addEventListener('keydown', onKey)
		// body scroll ni bloklash
		const prev = document.body.style.overflow
		document.body.style.overflow = 'hidden'

		return () => {
			document.removeEventListener('keydown', onKey)
			document.body.style.overflow = prev
		}
	}, [isOpen, onClose])

	if (!isOpen) return null

	return createPortal(
		<div className="fixed inset-0 z-[1000]">
			{/* Overlay */}
			<div
				className="absolute inset-0 bg-black/60 dark:bg-black/70 backdrop-blur-[2px]"
				onClick={onClose}
			/>

			{/* Dialog */}
			<div
				className="
          absolute left-1/2 top-1/2 w-[90vw] -translate-x-1/2 -translate-y-1/2
          rounded-2xl shadow-xl
          bg-white text-gray-900
          border border-gray-200
          dark:bg-slate-900 dark:text-gray-100 dark:border-slate-700
        "
				style={{ maxWidth: width }}
				role="dialog"
				aria-modal="true"
				aria-labelledby={titleId}
			>
				{/* Header */}
				<div
					className="
            flex items-center gap-3 border-b px-5 py-4
            border-gray-200 dark:border-slate-700
          "
				>
					<div id={titleId} className="flex-1 text-lg font-semibold">
						{title ?? T.defaultTitle}
					</div>

					<button
						aria-label={T.closeAria}
						className="
              inline-flex h-9 w-9 items-center justify-center rounded-md
              hover:bg-gray-100 dark:hover:bg-white/10
              focus:outline-none focus:ring-2 focus:ring-primary/40
            "
						onClick={onClose}
					>
						<HiX className="text-xl text-gray-600 dark:text-gray-300" />
					</button>
				</div>

				{/* Body */}
				<div className="px-5 py-4">{children}</div>
			</div>
		</div>,
		document.body
	)
}

export default Modal
