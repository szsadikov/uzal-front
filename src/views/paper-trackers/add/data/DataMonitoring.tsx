import React, { JSX } from 'react'
import type { FormikValues } from '../PaperTrackersAdd'

export default function DataMonitoring({
	values,
	Field
}: {
	values: FormikValues
	Field: ({ label, value }: { label: string; value?: React.ReactNode }) => JSX.Element
	yesNo: (v?: boolean | string) => string
}) {
	return (
		<div className='grid grid-cols-2 gap-8'>
			<Field label='Далолатнома №' value={values.mon_act_number || '—'} />
			<Field label='Далолатнома (дата)' value={values.mon_act_date || '—'} />
			<Field label='Қайд рақами' value={values.mon_reg_number || '—'} />
			<Field label='Қайд (дата)' value={values.mon_reg_date || '—'} />
		</div>
	)
}
