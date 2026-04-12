import React, { JSX } from 'react'
import type { FormikValues } from '../PaperTrackersAdd'

export default function DataMarketing({
	values,
	Field,
	yesNo
}: {
	values: FormikValues
	Field: ({ label, value }: { label: string; value?: React.ReactNode }) => JSX.Element
	yesNo: (v?: boolean | string) => string
}) {
	return (
		<div className='grid grid-cols-2 gap-8'>
			<Field label='Эксперт. хулоса №' value={values.mkt_exp_number || '—'} />
			<Field label='Эксперт. хулоса (дата)' value={values.mkt_exp_date || '—'} />
			<Field label='Рег. №' value={values.mkt_reg_number || '—'} />
			<Field label='Рег. дата' value={values.mkt_reg_date || '—'} />
			<Field label='Гарантия' value={yesNo(values.mkt_has_guarantee as any)} />
		</div>
	)
}
