import ConfirmDialog from '@/components/shared/ConfirmDialog'

type Props = {
	isOpen: boolean
	onClose: () => void
	onConfirm: () => void | Promise<void>
	title?: string
	message?: string
	confirmText?: string
	cancelText?: string
}

const SmsServiceDeleteConfirmation = ({
	isOpen,
	onClose,
	onConfirm,
	title = 'Удалить запись',
	message = 'Вы уверены, что хотите удалить эту запись? Это действие нельзя отменить.',
	confirmText = 'Удалить',
	cancelText = 'Отменить'
}: Props) => {
	return (
		<ConfirmDialog
			isOpen={isOpen}
			type='danger'
			title={title}
			cancelText={cancelText}
			confirmText={confirmText}
			confirmButtonColor='red-600'
			onClose={onClose}
			onRequestClose={onClose}
			onCancel={onClose}
			onConfirm={onConfirm}
		>
			<p>{message}</p>
		</ConfirmDialog>
	)
}

export default SmsServiceDeleteConfirmation
