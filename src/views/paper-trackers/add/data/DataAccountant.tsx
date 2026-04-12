import React, { JSX } from 'react'
import type { FormikValues } from '../PaperTrackersAdd'

export default function DataAccountant({
	values,
	Field
}: {
	values: FormikValues
	Field: ({ label, value }: { label: string; value?: React.ReactNode }) => JSX.Element
	yesNo: (v?: boolean | string) => string
}) {
	return (
		<div className='grid grid-cols-2 gap-8'>
			<Field label='Сумма аванса' value={values.acc_advance || '—'} />
			<Field label='Пошлина за регистрацию' value={values.acc_reg_fee || '—'} />
			<Field label='Счет-фактура (дата)' value={values.acc_invoice_date || '—'} />
			<Field label='Акт №' value={values.acc_act_number || '—'} />
			<Field label='Акт (дата)' value={values.acc_act_date || '—'} />
		</div>
	)
}
