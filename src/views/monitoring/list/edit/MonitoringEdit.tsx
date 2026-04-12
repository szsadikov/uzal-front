// src/pages/tech-monitoring/components/MonitoringEdit.tsx
import { useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import type { FormikProps } from 'formik'
import { Button, Drawer, Notification, toast } from '@/components/ui'
import { errorCatch } from '@/services/api.helpers'
import { TechService } from '@/services/tech.service'
import MonitoringForm, { FormModel } from '../form/MonitoringForm'
// TechMonitoringService.updateMonitoring<never, FormModel>(id, values)

type Props = {
	isOpen: boolean
	onClose: () => void
	initialData: FormModel & { id: number }
}

const MonitoringEdit = ({ isOpen, onClose, initialData }: Props) => {
	const formikRef = useRef<FormikProps<FormModel>>(null)

	const { mutateAsync: updateMonitoring, isPending: isUpdating } = useMutation({
		mutationKey: ['update tech monitoring'],
		mutationFn: ({ id, values }: { id: number; values: FormModel }) =>
			TechService.updateMonitoring<FormModel>(id, values),
		onSuccess() {
			toast.push(<Notification type='success' title='Мониторинг обновлён' duration={2000} />, {
				placement: 'top-center'
			})
			onClose()
		},
		onError(error) {
			toast.push(<Notification type='danger' title={errorCatch(error)} duration={2000} />, {
				placement: 'top-center'
			})
		}
	})

	const handleSave = () => formikRef.current?.submitForm()

	return (
		<Drawer
			title='Редактировать мониторинг'
			isOpen={isOpen}
			footer={
				<div className='w-full text-right'>
					<Button onClick={onClose} disabled={isUpdating}>
						Отмена
					</Button>
					<Button variant='solid' onClick={handleSave} disabled={isUpdating}>
						Сохранить
					</Button>
				</div>
			}
			onClose={onClose}
		>
			<MonitoringForm
				ref={formikRef}
				values={initialData}
				isSubmitting={isUpdating}
				onSubmitComplete={async (values) => {
					await updateMonitoring({ id: initialData.id, values })
				}}
			/>
		</Drawer>
	)
}

export default MonitoringEdit
