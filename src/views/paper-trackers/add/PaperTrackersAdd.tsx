import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { HiOutlineDocumentText, HiOutlineTrash, HiUpload } from 'react-icons/hi'
import { useQuery } from '@tanstack/react-query'
import { Form, Formik, FormikProps } from 'formik'
import * as Yup from 'yup'
import { Contract } from '@/@types/contract.types'
import { ContractMeta, ContractMetric } from '@/@types/dataset.types'
import { AdaptableCard } from '@/components/shared'
import { Button, FormContainer } from '@/components/ui'
import { DatasetService } from '@/services/dataset.service'
import { ProfileService } from '@/services/profile.service'
import { BegunokService } from '@/services/begunok.service'
import type { BegunokDetail } from '@/@types/begunok.types'

import AccountantTab from '../Tabs/components/AccountantTab'
import ExpeditorTab from '../Tabs/components/ExpeditorTab'
import FinancierTab from '../Tabs/components/FinancierTab'
import LawyerTab from '../Tabs/components/LawyerTab'
import MarketingTab from '../Tabs/components/MarketingTab'
import MonitoringTab from '../Tabs/components/MonitoringTab'
import ZamdepTab from '../Tabs/components/ZamdepTab'

import DataPanel from './data/DataPanel'
import PaperTrackersPreview, { type TabKey } from './PaperTrackersPreview'
import SignModal from './components/SignModal'

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

/* --- Tab config --- */
const TAB_ORDER: TabKey[] = [
	'expeditor',
	'financier',
	'accountant',
	'lawyer',
	'marketing',
	'monitoring',
	'zamdep',
]
const TAB_LABEL: Record<TabKey, string> = {
	expeditor: 'Экспедитор',
	financier: 'Финансист',
	accountant: 'Бухгалтер',
	lawyer: 'Юрист',
	marketing: 'Маркетинг',
	monitoring: 'Мониторинг',
	zamdep: 'Зампред',
}

function TabBarInline({ active, onChange }: { active: TabKey; onChange: (t: TabKey) => void }) {
	return (
		<div className='pt-tabs mb-3 border-b border-gray-200'>
			<div className='-mb-px flex gap-6'>
				{TAB_ORDER.map((k) => (
					<button
						key={k}
						type='button'
						onClick={() => onChange(k)}
						className={`relative pb-2 text-sm ${active === k ? 'font-medium text-indigo-600' : 'text-gray-600 hover:text-gray-900'}`}
					>
						{TAB_LABEL[k]}
						{active === k && (
							<span className='absolute -bottom-[1px] left-0 h-0.5 w-full rounded-full bg-indigo-600' />
						)}
					</button>
				))}
			</div>
		</div>
	)
}

/* helpers */
const dash = (v: unknown) => (v === 0 || (!!v && String(v).trim()) ? String(v) : '—')

function toTabKey(roleKey: string): TabKey {
	const k = roleKey?.toLowerCase()
	const map: Record<string, TabKey> = {
		expeditor: 'expeditor',
		finance: 'financier',
		financier: 'financier',
		accountant: 'accountant',
		accounting: 'accountant',
		jurist: 'lawyer',
		lawyer: 'lawyer',
		marketing: 'marketing',
		monitoring: 'monitoring',
		zampred: 'zamdep',
		zamdep: 'zamdep',
	}
	return map[k] ?? 'expeditor'
}

function useCurrentRoleTab() {
	const fetchProfile = async () => {
		const svc: any = ProfileService as any
		if (svc?.getMe) return await svc.getMe()
		if (svc?.getProfile) return await svc.getProfile()
		if (svc?.me) return await svc.me()
		throw new Error('ProfileService: method not found (getMe/getProfile/me)')
	}

	const { data } = useQuery({
		queryKey: ['profile', 'me'],
		queryFn: fetchProfile,
		staleTime: 5 * 60 * 1000,
	})

	const rawRole =
		data?.data?.role?.key ??
		data?.data?.role_key ??
		data?.data?.role?.code ??
		data?.data?.role ??
		(data as any)?.user?.role_key ??
		(data as any)?.user?.role?.key ??
		(data as any)?.role_key ??
		(data as any)?.role ??
		''

	return useMemo(() => toTabKey(String(rawRole || '')), [rawRole])
}

/* Detail → Formik mapping */
function mapDetailToForm(d: BegunokDetail): FormikValues {
	return {
		code: d.code || '',
		contract_date: d.contract_date as unknown as string,
		attachments: [],

		// EXPEDITOR
		exp_insurance_number: d.expeditor_insurance_policy || '',
		exp_insurance_date: d.expeditor_insurance_policy_date || '',

		// FINANCIER
		financier_ok: d.financial_situation ?? false,
		financier_no_debt: d.no_debt ?? false,

		// ACCOUNTANT
		acc_advance: d.deposit || '',
		acc_reg_fee: d.registration_fee || '',
		acc_invoice_date: d.invoice_date || '',
		acc_act_number: d.insurance_act || '',
		acc_act_date: d.insurance_act_date || '',

		// LAWYER
		law_contract_num: d.supply_contract || '',
		law_guarantee_info: d.jurist_insurance_policy || '',

		// MARKETING
		mkt_exp_number: d.contract_application_code || '',
		mkt_exp_date: d.contract_application_date || '',
		mkt_reg_number: d.noted || '',
		mkt_reg_date: d.noted_date || '',
		mkt_has_guarantee: d.marketing_has_supply_contract ? 'Да' : 'Нет',

		// MONITORING
		mon_act_number: d.acceptance_certificate || '',
		mon_act_date: d.acceptance_certificate_date || '',
		mon_reg_number: d.department_record || '',
		mon_reg_date: d.department_record_date || '',

		// ZAMDEP
		zamdep_date: d.zampred_date || '',
	}
}

const PaperTrackersAdd = () => {
	const { id } = useParams<{ id: string }>()
	const begunokId = id ? Number(id) : 0

	const [activeTab, setActiveTab] = useState<TabKey>('expeditor')
	const [mode, setMode] = useState<'document' | 'data'>('document')

	// Sign modal (PATCH keyin, hozir faqat yopamiz)
	const [isSignOpen, setIsSignOpen] = useState(false)
	const navigate = useNavigate()

	const formikRef = useRef<FormikProps<FormikValues>>(null)
	const fileInputRef = useRef<HTMLInputElement>(null)

	const roleTab = useCurrentRoleTab()

	// Role kelganda aktiv tabni bir marta sync qilib qo'yamiz
	useEffect(() => {
		setActiveTab((prev) => (prev ? prev : roleTab))
	}, [roleTab])

	// Meta (sizda bor)
	const { data: metas } = useQuery({
		queryKey: ['get meta contracts'],
		queryFn: () =>
			DatasetService.getMetaContracts<{ contract_meta: ContractMeta[]; metrics: ContractMetric }>(),
		select: ({ data }) => data,
	})
	const meta = metas?.contract_meta.find((m) => m.id === 4)
	if (!meta) {
		// meta topilmasa — hech narsa qaytarmaymiz (sizde shu mantiq bor)
	}

	// DETAIL — begunok ma’lumotlari
	const { data: detail, isLoading: isDetailLoading } = useQuery({
		queryKey: ['begunok', begunokId],
		queryFn: async () => {
			if (!begunokId) return null
			const res = await BegunokService.getById<BegunokDetail>(begunokId)
			return res.data
		},
		enabled: !!begunokId,
	})

	// initial values
	const [initValues, setInitValues] = useState<FormikValues>({
		contract_date: new Date() as unknown as string,
		code: '',
		attachments: [],
	})

	useEffect(() => {
		if (detail) {
			const mapped = mapDetailToForm(detail)
			setInitValues(mapped)
			// header uchun “Бегунок №”
			setTimeout(() => formikRef.current?.setFieldValue('code', detail.code, false), 0)
		}
	}, [detail])

	const onSubmit = async () => {
		// hozir submit ishlatilmaydi; PATCH keyin qo‘shamiz
		console.log('submit (GET only mode)')
	}

	const handleDecline = () => {
		const canGoBack = (window.history as any)?.state?.idx > 0
		if (canGoBack) navigate(-1)
		else navigate('/begunok')
	}

	// SignModal onSubmit — hozircha faqat yopamiz
	const handleSignSubmit = async () => {
		setIsSignOpen(false)
	}

	// file helpers (UI saqlanadi)
	const uid = () =>
		typeof crypto !== 'undefined' && (crypto as any).randomUUID
			? (crypto as any).randomUUID()
			: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
	const openFileDialog = () => fileInputRef.current?.click()
	const onPickFiles = (files: FileList | null) => {
		if (!files || !formikRef.current) return
		const cur = formikRef.current.values.attachments ?? []
		const next: Attachment[] = [...cur]
		Array.from(files).forEach((f) => next.push({ id: uid(), name: f.name, size: f.size, file: f }))
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

	// Loader
	if (begunokId && isDetailLoading && !detail) {
		return <div className='p-6 text-sm text-gray-500'>Загрузка данных бегунка...</div>
	}

	return (
		<Formik<FormikValues>
			innerRef={formikRef}
			enableReinitialize
			initialValues={initValues}
			validationSchema={validationSchema}
			onSubmit={onSubmit}
		>
			{({ values }) => {
				const contractNum = dash((values as any)?.code)

				return (
					<Form className='grid grid-cols-[1fr_373px] content-start items-start gap-6'>
						{/* HEADER */}
						<h3 className='col-span-full -mb-2 flex flex-wrap items-center'>
							<span>Бегунок № {contractNum !== '—' ? contractNum : '____________'}</span>
						</h3>

						{/* LEFT */}
						<div className='space-y-4'>
							<TabBarInline active={activeTab} onChange={setActiveTab} />

							{/* Документ / Данные toggle */}
							<div className='w-full'>
								<div className='rounded-lg p-1'>
									<div className='grid grid-cols-2 gap-1'>
										<button
											type='button'
											aria-selected={mode === 'document'}
											onClick={() => setMode('document')}
											className={`h-10 w-full rounded-md text-sm font-medium transition ${
												mode === 'document'
													? 'bg-indigo-600 text-white shadow-sm'
													: 'border border-gray-200 bg-white text-gray-700 hover:bg-white'
											}`}
										>
											Документ
										</button>
										<button
											type='button'
											aria-selected={mode === 'data'}
											onClick={() => setMode('data')}
											className={`h-10 w-full rounded-md text-sm font-medium transition ${
												mode === 'data'
													? 'bg-indigo-600 text-white shadow-sm'
													: 'border border-gray-200 bg-white text-gray-700 hover:bg-white'
											}`}
										>
											Данные
										</button>
									</div>
								</div>
							</div>

							{/* CONTENT */}
							{mode === 'document' ? (
								<div className='paper-preview'>
									<PaperTrackersPreview
										values={values}
										activeTab={activeTab}
										onActiveChange={setActiveTab}
									/>
								</div>
							) : (
								<DataPanel tab={activeTab} values={values} />
							)}
						</div>

						{/* RIGHT — Document: rolega mos forma; Data: oq placeholder */}
						{mode === 'document' ? (
							<AdaptableCard className='sticky top-6 h-full w-full' bodyClass='h-full'>
								<FormContainer className='flex h-full flex-col'>
									<div className='mt-8' />

									{/** Faqat foydalanuvchi roli ichidagi forma ko‘rinadi */}
									{roleTab === 'expeditor' && <ExpeditorTab />}
									{roleTab === 'financier' && <FinancierTab />}
									{roleTab === 'accountant' && <AccountantTab />}
									{roleTab === 'lawyer' && <LawyerTab />}
									{roleTab === 'marketing' && <MarketingTab />}
									{roleTab === 'monitoring' && <MonitoringTab />}
									{roleTab === 'zamdep' && <ZamdepTab />}

									{/* Прикрепить файл (UI) */}
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
								</FormContainer>
							</AdaptableCard>
						) : (
							<AdaptableCard
								className='sticky top-6 h-full w-full border-transparent bg-white p-4'
								bodyClass='min-h-[300px]'
								aria-hidden
							/>
						)}

						{/* FLOATING actions — faqat DOCUMENT rejimida */}
						{mode === 'document' && (
							<div className='fixed right-8 bottom-6 z-50'>
								<div className='flex gap-3 rounded-xl p-2'>
									<Button
										type='button'
										size='md'
										className='h-11 border border-gray-300 text-gray-700 hover:bg-gray-50'
										onClick={handleDecline}
									>
										Отказать
									</Button>

									<Button
										type='button'
										size='md'
										variant='solid'
										className='h-11 bg-indigo-600 hover:bg-indigo-500'
										onClick={() => setIsSignOpen(true)}
									>
										Подписать
									</Button>
								</div>
							</div>
						)}

						{/* SIGN MODAL — hozircha faqat yopiladi */}
						<SignModal
							open={isSignOpen}
							onClose={() => setIsSignOpen(false)}
							onSubmit={handleSignSubmit}
							keys={[
								{ id: 'key-1', label: 'USB Key #1' },
								{ id: 'key-2', label: 'Token EZ-2025' },
							]}
						/>
					</Form>
				)
			}}
		</Formik>
	)
}

export default PaperTrackersAdd
