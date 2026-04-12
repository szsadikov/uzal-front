import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Drawer } from '@/components/ui'
import TaskForm, { TaskFormValues } from '../form/Form'

export type Option = { label: string; value: number }

// EDIT rejimi uchun GET'dan keladigan label'lar
type EditLabels = {
	region?: string | null
	monitoring?: string | null
	client?: string | null
}

type Props = {
	isOpen: boolean
	onClose: () => void
	data: TaskFormValues
	onUpdate: (payload: TaskFormValues) => Promise<void> | void

	branchOptions: Option[]
	employeeOptions?: Option[]
	clientOptions?: Option[]

	loadEmployees?: (branchId: number | null) => Promise<Option[]> | Option[]
	loadClients?: (employeeId: number | null) => Promise<Option[]> | Option[]

	editLabels?: EditLabels
}

const TaskEdit = ({
	isOpen,
	onClose,
	data,
	onUpdate,
	branchOptions,
	employeeOptions = [],
	clientOptions = [],
	loadEmployees,
	loadClients,
	editLabels
}: Props) => {
	const { t } = useTranslation()
	const formRef = useRef<any>(null)
	const [submitting, setSubmitting] = useState(false)

	// Drawer ochilganda dependent optionlarni oldindan yuklab qo'yamiz
	useEffect(() => {
		if (!isOpen) return
		const run = async () => {
			// if (loadEmployees && (data?.branch ?? null)) await loadEmployees(data.branch)
			if (loadEmployees) await loadEmployees(data?.branch ?? null)
			if (loadClients) await loadClients(data?.employee ?? null)
			// if (!editLabels) {
			// 	if (loadEmployees && (data?.branch ?? null)) await loadEmployees(data.branch)
			// 	if (loadClients) await loadClients(data?.employee ?? null)
			// }
		}
		void run()
	}, [isOpen, data?.branch, data?.employee])

	const handleSubmit = async (values: TaskFormValues) => {
		try {
			setSubmitting(true)
			await onUpdate(values)
			onClose()
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<Drawer
			isOpen={isOpen}
			onClose={onClose}
			title={t('Редактировать задачу')}
			footer={
				<div className='w-full text-right'>
					<Button size='sm' className='mr-2' onClick={onClose} disabled={submitting}>
						{t('Отмена')}
					</Button>
					<Button
						size='sm'
						variant='solid'
						onClick={() => formRef.current?.submitForm?.() ?? formRef.current?.handleSubmit?.()}
						loading={submitting}
					>
						{t('Сохранить')}
					</Button>
				</div>
			}
		>
			<div className='p-4'>
				<TaskForm
					ref={formRef}
					values={data}
					onSubmitComplete={handleSubmit}
					isSubmitting={submitting}
					branchOptions={branchOptions}
					employeeOptions={employeeOptions}
					clientOptions={clientOptions}
					onLoadEmployees={loadEmployees}
					onLoadClients={loadClients}
					editLabels={editLabels}
				/>
			</div>
		</Drawer>
	)
}

export default TaskEdit
