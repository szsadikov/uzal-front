// src/pages/.../CurrentAddPreview.tsx
import './demand-letter.css'

import { useTranslation } from 'react-i18next'
import type { CurrentRequestContract } from '@/@types/contract.types'
import { AdaptableCard } from '@/components/shared'
import type { CompanyPayload, FormModel } from '../form/CurrentRequestForm'
import DemandLetterHtml from './DemandLetterHtml'

type Props = {
	values: FormModel
	companyData?: CompanyPayload | null
	contractData?: CurrentRequestContract | null
}

export default function CurrentAddPreview({ values, companyData, contractData }: Props) {
	const { t } = useTranslation()

	return (
		<AdaptableCard className='h-full' bodyClass='h-full'>
			<h3 className='mb-4 flex flex-wrap items-center'>
				<span>{t('Талабнома')}</span>
			</h3>
			<div className='demand-letter'>
				<DemandLetterHtml values={values} companyData={companyData} contractData={contractData} />
			</div>
		</AdaptableCard>
	)
}
