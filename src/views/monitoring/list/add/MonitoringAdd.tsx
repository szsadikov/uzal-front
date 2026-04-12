// src/pages/tech-monitoring/components/MonitoringAdd.tsx
import { useRef, useState } from 'react'
import { HiPlusCircle } from 'react-icons/hi'
import { useMutation } from '@tanstack/react-query'
import type { FormikProps } from 'formik'
import { Button, Drawer, Notification, toast } from '@/components/ui'
import { errorCatch } from '@/services/api.helpers'
import { TechService } from '@/services/tech.service'
import MonitoringForm, { FormModel } from '../form/MonitoringForm'
// TechMonitoringService.createMonitoring<never, FormModel>(values)

const MonitoringAdd = () => {
	const formikRef = useRef<FormikProps<FormModel>>(null)
	const [isOpen, setIsOpen] = useState(false)

	const { mutateAsync: createMonitoring, isPending: isCreating } = useMutation({
		mutationKey: ['create tech monitoring'],
		mutationFn: (values: FormModel) => TechService.createMonitoring<FormModel>(values),
		onSuccess() {
			toast.push(<Notification type='success' title='Мониторинг создан' duration={2000} />, {
				placement: 'top-center'
			})
			setIsOpen(false)
		},
		onError(error) {
			toast.push(<Notification type='danger' title={errorCatch(error)} duration={2000} />, {
				placement: 'top-center'
			})
		}
	})

	const handleSave = () => formikRef.current?.submitForm()

	return (
		<>
			<Button
				variant='solid'
				size='sm'
				className='ml-2'
				icon={<HiPlusCircle />}
				onClick={() => setIsOpen(true)}
			>
				Добавить
			</Button>

			<Drawer
				title='Добавить мониторинг'
				isOpen={isOpen}
				footer={
					<div className='w-full text-right'>
						<Button onClick={() => setIsOpen(false)} disabled={isCreating}>
							Отмена
						</Button>
						<Button variant='solid' onClick={handleSave} disabled={isCreating}>
							Сохранить
						</Button>
					</div>
				}
				onClose={() => setIsOpen(false)}
			>
				<MonitoringForm
					ref={formikRef}
					values={{
						license_plate_number: '',
						condition: null,
						vin: '',
						engine_number: '',
						comment: '',
						images: [],
						task: 0
					}}
					isSubmitting={isCreating}
					onSubmitComplete={async (values) => {
						await createMonitoring(values)
					}}
				/>
			</Drawer>
		</>
	)
}

export default MonitoringAdd
