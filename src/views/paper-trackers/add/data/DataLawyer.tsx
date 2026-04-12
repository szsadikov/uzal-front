import React, { JSX } from 'react'
import type { FormikValues } from '../PaperTrackersAdd'

export default function DataLawyer({
	values,
	Field
}: {
	values: FormikValues
	Field: ({ label, value }: { label: string; value?: React.ReactNode }) => JSX.Element
	yesNo: (v?: boolean | string) => string
}) {
	return (
		<div className='grid grid-cols-2 gap-8'>
			<Field label='Таминот шартномаси №' value={values.law_contract_num || '—'} />
			<Field label='Кафолат маълумоти' value={values.law_guarantee_info || '—'} />
		</div>
	)
}
