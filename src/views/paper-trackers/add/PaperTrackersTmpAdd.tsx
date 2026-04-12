import { useRef, useState } from 'react'
import { HiOutlineDocumentText, HiOutlineTrash, HiUpload } from 'react-icons/hi'
import { useQuery } from '@tanstack/react-query'
import { Form, Formik, FormikProps } from 'formik'
import * as Yup from 'yup'
import { Contract } from '@/@types/contract.types'
import { ContractMeta, ContractMetric } from '@/@types/dataset.types'
import { AdaptableCard } from '@/components/shared'
import { Button, FormContainer } from '@/components/ui'
import { DatasetService } from '@/services/dataset.service'
import AccountantTab from '../Tabs/components/AccountantTab'
import ExpeditorTab from '../Tabs/components/ExpeditorTab'
import FinancierTab from '../Tabs/components/FinancierTab'
import LawyerTab from '../Tabs/components/LawyerTab'
import MarketingTab from '../Tabs/components/MarketingTab'
import MonitoringTab from '../Tabs/components/MonitoringTab'
import ZamdepTab from '../Tabs/components/ZamdepTab'
import PaperTrackersPreview, { type TabKey } from './PaperTrackersPreview'

export type FormModel = Omit<Contract, 'id' | 'created_at'>

export type Attachment = {
	id: string
	name: string
	size: number
	file: File
}

export type ExtraFields = {
	attachments: Attachment[]

	// EXPEDITOR
	exp_insurance_number?: string
	exp_insurance_date?: string

	// FINANCIER
	financier_ok?: boolean
	financier_no_debt?: boolean

	// ACCOUNTANT
	acc_advance?: string
	acc_reg_fee?: string
	acc_invoice_date?: string
	acc_act_number?: string
	acc_act_date?: string

	// MARKETING
	mkt_exp_number?: string
	mkt_exp_date?: string
	mkt_reg_number?: string
	mkt_reg_date?: string
	mkt_has_guarantee?: string

	// MONITORING
	mon_act_number?: string
	mon_act_date?: string
	mon_reg_number?: string
	mon_reg_date?: string

	// LAWYER
	law_contract_num?: string
	law_guarantee_info?: string

	// ZAMDEP
	zamdep_date?: string
}

export type FormikValues = Partial<FormModel> & ExtraFields

const validationSchema = Yup.object().shape({
	code: Yup.string().required('Поле обязательно'),
	contract_date: Yup.string().required('Поле обязательно'),
})

const PaperTrackersAdd = () => {
	/** Yagona holat — tab previewda ko‘rinadi, lekin shu yerda saqlanadi */
	const [activeTab, setActiveTab] = useState<TabKey>('expeditor')

	const formikRef = useRef<FormikProps<FormikValues>>(null)
	const fileInputRef = useRef<HTMLInputElement>(null)

	const { data: metas } = useQuery({
		queryKey: ['get meta contracts'],
		queryFn: () =>
			DatasetService.getMetaContracts<{ contract_meta: ContractMeta[]; metrics: ContractMetric }>(),
		select: ({ data }) => data,
	})
	const meta = metas?.contract_meta.find((m) => m.id === 4)
	if (!meta) return null

	const onSubmit = async () => {
		console.log('formData')
	}

	const initialValues: FormikValues = {
		contract_date: new Date() as unknown as string,
		code: '',
		attachments: [],
	}

	// --- helpers ---
	const uid = () =>
		typeof crypto !== 'undefined' && (crypto as any).randomUUID
			? (crypto as any).randomUUID()
			: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

	const openFileDialog = () => fileInputRef.current?.click()

	const onPickFiles = (files: FileList | null) => {
		if (!files || !formikRef.current) return
		const cur = formikRef.current.values.attachments ?? []
		const next: Attachment[] = [...cur]

		Array.from(files).forEach((f) => {
			next.push({ id: uid(), name: f.name, size: f.size, file: f })
		})

		formikRef.current.setFieldValue('attachments', next)
	}

	const removeFile = (id: string) => {
		if (!formikRef.current) return
		const cur = formikRef.current.values.attachments ?? []
		formikRef.current.setFieldValue(
			'attachments',
			cur.filter((f) => f.id !== id),
		)
	}

	const formatSize = (b: number) => `${Math.round(b / 1024)} кб`

	return (
		<Formik<FormikValues>
			innerRef={formikRef}
			enableReinitialize
			initialValues={initialValues}
			validationSchema={validationSchema}
			onSubmit={onSubmit}
		>
			{({ values, isSubmitting }) => (
				<Form className='grid grid-cols-[1fr_373px] content-start items-start gap-4'>
					{/* PREVIEW (chap): TabBar ham shu yerda, lekin boshqaruv parentda */}
					<PaperTrackersPreview
						values={values}
						activeTab={activeTab}
						onActiveChange={setActiveTab}
					/>

					{/* FORMA (o‘ng) */}
					<AdaptableCard className='h-full p-4' bodyClass='h-full'>
						<FormContainer className='flex h-full flex-col mt-12'>
							{/* (TabBar bu yerda EMAS — preview ichida) */}

							{/* Umumiy rekvizitlar */}
							<div className='-mx-4 border-t border-gray-200' />

							{/* Tabga xos formalar */}
							<div className='mt-8' />
							{activeTab === 'expeditor' && <ExpeditorTab />}
							{activeTab === 'financier' && <FinancierTab />}
							{activeTab === 'accountant' && <AccountantTab />}
							{activeTab === 'lawyer' && <LawyerTab />}
							{activeTab === 'marketing' && <MarketingTab />}
							{activeTab === 'monitoring' && <MonitoringTab />}
							{activeTab === 'zamdep' && <ZamdepTab />}

							{/* === Прикрепить файл === */}
							<div className='mt-4 space-y-3'>
								<input
									ref={fileInputRef}
									type='file'
									multiple
									className='hidden'
									onChange={(e) => onPickFiles(e.target.files)}
								/>

								<Button
									type='button'
									size='md'
									variant='solid'
									className='h-11 w-full justify-between bg-indigo-600 text-white hover:bg-indigo-500 focus:ring-2 focus:ring-indigo-300'
									onClick={openFileDialog}
								>
									<span className='flex w-full items-center justify-between gap-2'>
										<span className='flex items-center gap-2'>Прикрепить файл</span>
										<HiUpload className='text-xl' />
									</span>
								</Button>

								{values.attachments?.length > 0 && (
									<div className='space-y-2'>
										{values.attachments.map((f) => (
											<div
												key={f.id}
												className='flex items-center justify-between rounded-md border border-gray-200 px-3 py-2'
											>
												<div className='flex min-w-0 items-center gap-2'>
													<HiOutlineDocumentText className='shrink-0 text-lg text-indigo-600' />
													<div className='min-w-0'>
														<div className='truncate text-sm text-gray-900'>{f.name}</div>
														<div className='text-xs text-gray-500'>{formatSize(f.size)}</div>
													</div>
												</div>

												<button
													type='button'
													onClick={() => removeFile(f.id)}
													className='inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-gray-100'
													title='Удалить'
												>
													<HiOutlineTrash className='text-base text-gray-600' />
												</button>
											</div>
										))}
									</div>
								)}
							</div>
							{/* === /Прикрепить файл === */}

							<div className='-mx-4 mt-6 border-t border-gray-200' />
							<div className='flex justify-end gap-4 pt-4'>
								<Button size='md' className='h-11 border' type='button'>
									Отказать
								</Button>
								<Button
									type='submit'
									size='md'
									variant='solid'
									loading={isSubmitting}
									className='h-11 bg-indigo-600 hover:bg-indigo-500'
								>
									Подписать
								</Button>
							</div>
						</FormContainer>
					</AdaptableCard>
				</Form>
			)}
		</Formik>
	)
}

export default PaperTrackersAdd
