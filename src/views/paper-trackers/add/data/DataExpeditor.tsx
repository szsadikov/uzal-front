import React, { JSX } from 'react'
import type { FormikValues } from '../PaperTrackersAdd'

export default function DataExpeditor({
	values,
	Field
}: {
	values: FormikValues
	Field: ({ label, value }: { label: string; value?: React.ReactNode }) => JSX.Element
	yesNo: (v?: boolean | string) => string
}) {
	return (
		<div className='grid grid-cols-2 gap-8'>
			<Field label='Полис страховки' value={values.exp_insurance_number || '—'} />
			<Field label='Дата' value={values.exp_insurance_date || '—'} />
		</div>
	)
}
