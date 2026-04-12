import React, { JSX } from 'react'
import type { FormikValues } from '../PaperTrackersAdd'

export default function DataFinancier({
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
			<Field label='Молиявий ҳолати' value={yesNo(values.financier_ok)} />
			<Field label='Қарздорлиги мавжуд эмас' value={yesNo(values.financier_no_debt)} />
		</div>
	)
}
