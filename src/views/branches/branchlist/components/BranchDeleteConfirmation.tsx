import ConfirmDialog from '@/components/shared/ConfirmDialog'
// import Notification from '@/components/ui/Notification'
// import toast from '@/components/ui/toast'
// import {
// 	deleteUser,
// 	getUsers,
// 	toggleDeleteConfirmation,
// 	useAppDispatch,
// 	useAppSelector
// } from '../store'

const BranchDeleteConfirmation = () => {
	// const dispatch = useAppDispatch()
	// const {deleteConfirmation, selectedUser, tableData} = useAppSelector((state) => state.userList.data)

	const onDialogClose = () => {
		console.log('onDialogClose')
		// dispatch(toggleDeleteConfirmation(false))
	}

	const onDelete = async () => {
		console.log('onDelete')
		// dispatch(toggleDeleteConfirmation(false))
		// const success = await deleteUser({ id: selectedUser })

		// if (success) {
		// 	dispatch(getUsers(tableData))
		// 	toast.push(
		// 		<Notification title={'Successfully Deleted'} type='success' duration={2500}>
		// 			User successfully deleted
		// 		</Notification>,
		// 		{
		// 			placement: 'top-center'
		// 		}
		// 	)
		// }
	}

	return (
		<ConfirmDialog
			isOpen={false} // deleteConfirmation
			type='danger'
			title='Delete user'
			confirmButtonColor='red-600'
			onClose={onDialogClose}
			onRequestClose={onDialogClose}
			onCancel={onDialogClose}
			onConfirm={onDelete}
		>
			<p>
				Are you sure you want to delete this user? All record related to this user will be deleted
				as well. This action cannot be undone.
			</p>
		</ConfirmDialog>
	)
}

export default BranchDeleteConfirmation
