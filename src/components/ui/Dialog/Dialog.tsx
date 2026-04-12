import type { MouseEvent } from 'react'
import type ReactModal from 'react-modal'
import Modal from 'react-modal'
import classNames from 'classnames'
import { motion } from 'framer-motion'
import CloseButton from '../CloseButton'
// import useWindowSize from '../hooks/useWindowSize'

export interface DialogProps extends ReactModal.Props {
	closable?: boolean
	contentClassName?: string
	height?: string | number
	onClose?: (e: MouseEvent<HTMLSpanElement>) => void
	width?: number
}

const Dialog = (props: DialogProps) => {
	// const currentSize = useWindowSize()

	const {
		bodyOpenClassName,
		children,
		className,
		closable = true,
		closeTimeoutMS = 150,
		contentClassName,
		height,
		isOpen,
		onClose,
		overlayClassName,
		portalClassName,
		style,
		width = 520,
		...rest
	} = props

	const onCloseClick = (e: MouseEvent<HTMLSpanElement>) => {
		onClose?.(e)
	}

	const renderCloseButton = (
		<CloseButton absolute  className="ltr:top-4 ltr:right-4 rtl:top-4 rtl:left-4" onClick={onCloseClick} />
	)

	// ⭐ MUHIM QISM: overlay + content stilini markazlash va padding bilan
	const contentStyle: ReactModal.Styles = {
		overlay: {
			backgroundColor: 'rgba(0,0,0,0.55)', // qoraroq fon
			zIndex: 50,
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			padding: '1rem', // ekran chetlaridan biroz bo'sh joy
			...(style?.overlay || {})
		},
		content: {
			inset: 'unset',           // default top/left/right/bottom ni o'chiramiz
			padding: 0,               // ichki paddingni biz o'zimiz beramiz (ConfirmDialog ichida)
			border: 'none',
			background: 'transparent',
			...(style?.content || {})
		}
	}

	// width / height logikasi o'sha-o'sha
	// if (width !== undefined) {
	// 	contentStyle.content.width = '100%'
	// 	contentStyle.content.maxWidth = width
	//
	// 	if (typeof currentSize.width !== 'undefined' && currentSize.width <= width) {
	// 		contentStyle.content.maxWidth = currentSize.width - 32 // mobil uchun ozgina margin
	// 	}
	// }
	//
	// if (height !== undefined) {
	// 	contentStyle.content.height = height
	// }

	const defaultDialogContentClass = 'dialog-content'
	const dialogClass = classNames(defaultDialogContentClass, contentClassName)

	return (
		<Modal
			className={{
				base: classNames('dialog', className as string),
				afterOpen: 'dialog-after-open',
				beforeClose: 'dialog-before-close'
			}}
			overlayClassName={{
				base: classNames('dialog-overlay', overlayClassName as string),
				afterOpen: 'dialog-overlay-after-open',
				beforeClose: 'dialog-overlay-before-close'
			}}
			portalClassName={classNames('dialog-portal', portalClassName)}
			bodyOpenClassName={classNames('dialog-open', bodyOpenClassName)}
			ariaHideApp={false}
			isOpen={isOpen}
			style={contentStyle}
			closeTimeoutMS={closeTimeoutMS}
			{...rest}
		>
			<motion.div
				className={dialogClass}
				initial={{ transform: 'scale(0.9)' }}
				animate={{
					transform: isOpen ? 'scale(1)' : 'scale(0.9)'
				}}
			>
				{closable && renderCloseButton}
				{children}
			</motion.div>
		</Modal>
	)
}

Dialog.displayName = 'Dialog'

export default Dialog
