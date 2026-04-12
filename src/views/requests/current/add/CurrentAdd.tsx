import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { pdf, PDFViewer } from '@react-pdf/renderer'
import { useMutation } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import type { FormikProps } from 'formik'
import type { CurrentRequestContract } from '@/@types/contract.types'
import { AdaptableCard } from '@/components/shared'
import { Button, Notification, toast } from '@/components/ui'
import { pickErrorTitle } from '@/services/api.helpers'
import { PaymentNoticeService } from '@/services/payment-notice.service'
import CurrentRequestForm, { CompanyPayload, FormModel } from '../form/CurrentRequestForm'
import DemandLetterPdf from './DemandLetterPdf'
import RequestAddFormPreview from './RequestAddFormPreview'

// ==== Defaults ====
const DEFAULT_VALUES: FormModel = {
	code: '',
	stir: '',
	contract: null,
	company_name: '',
	phone_number: '',
	overdue_amount: '',
	main_amount_of_payment: '',
	address: '',
	tech_name: '',
	pdf_document: null,
	jurist_full_name: null,
	jurist_role: null,
	jurist_phone: null,
}

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null
const toNumberOrNull = (v: unknown): number | null => {
	if (v == null) return null
	if (typeof v === 'number') return Number.isFinite(v) ? v : null
	const n = Number(String(v).trim())

	return Number.isFinite(n) ? n : null
}
const readNumberLike = (obj: unknown, key: string): number | null =>
	isObject(obj) && key in obj ? toNumberOrNull((obj as any)[key]) : null
const readStringLike = (obj: unknown, key: string): string => {
	if (!isObject(obj) || !(key in obj)) return ''
	const v = (obj as any)[key]
	if (typeof v === 'string') return v.trim()
	if (typeof v === 'number') return String(v)

	return ''
}

const CurrentAdd = () => {
	const { t } = useTranslation()

	const formikRef = useRef<FormikProps<FormModel>>(null)
	const pdfRef = useRef<HTMLDivElement>(null)

	const [previewValues, setPreviewValues] = useState<FormModel>(DEFAULT_VALUES)
	const [companyData, setCompanyData] = useState<CompanyPayload | null>(null)
	const [contractData, setContractData] = useState<CurrentRequestContract | null>(null)

	const [isSaving, setIsSaving] = useState(false) // double-submit guard
	const [isNavigating, setIsNavigating] = useState(false) // cancel double-click guard
	const [confirmOpen, setConfirmOpen] = useState(false) // confirm popup holati
	const [codeLoading, setCodeLoading] = useState(false) // UI ko‘rsatkich

	const navigate = useNavigate()

	const lastCodeReqRef = useRef<number | null>(null)

	// ✅ Create mutation
	const { mutateAsync: createPaymentNotice, isPending: isCreating } = useMutation<
		unknown,
		AxiosError,
		FormData
	>({
		mutationKey: ['create-payment-notice'],
		mutationFn: (fd) => PaymentNoticeService.createPaymentNotice(fd),
		onSuccess: () => {
			toast.push(<Notification type='success' title={t('Уведомление создано')} duration={2000} />, {
				placement: 'top-center'
			})
			formikRef.current?.resetForm({ values: DEFAULT_VALUES })
			setPreviewValues(DEFAULT_VALUES)
			setCompanyData(null)
			setContractData(null)
			navigate('/requests/current', { replace: true })
		},
		onError: (error) => {
			const title = pickErrorTitle(error)
			console.error(error)
			toast.push(<Notification type='danger' title={title} duration={2000} />, {
				placement: 'top-center'
			})
		},
		retry: 0
	})

	/** 🔹 get_next_code bo‘yicha mutation (kod olish) */
	const { mutateAsync: fetchNextCode } = useMutation<{ code: string }, AxiosError, number>({
		mutationKey: ['payment-notice-next-code'],
		mutationFn: (contractId: number) => PaymentNoticeService.getNextCode(contractId),
		onError: (err) => {
			const title = pickErrorTitle(err)
			toast.push(<Notification type='danger' title={title} duration={2000} />, {
				placement: 'top-center'
			})
		}
	})

	/** 🔹 CONTRACT tanlanganda kodni avtomatik olish (faqat code bo‘sh bo‘lsa) */
	useEffect(() => {
		const f = formikRef.current
		if (!f) return

		// faqat Formik'dagi tanlangan PK (Select value = item.id) ni olaylik
		const contractId = toNumberOrNull(f.values?.contract)
		if (!contractId || contractId <= 0) return

		// code allaqachon bor bo'lsa yoki aynan shu id uchun so'rov yuborilgan bo'lsa — STOP
		const currentCode = String(f.values?.code ?? '').trim()
		if (currentCode) return
		if (lastCodeReqRef.current === contractId) return

		lastCodeReqRef.current = contractId

		let cancelled = false
		setCodeLoading(true)

		fetchNextCode(contractId)
			.then(({ code }) => {
				if (cancelled) return
				// o'sha kontrakt hali ham tanlanganmi?
				const stillSelected = toNumberOrNull(formikRef.current?.values?.contract)
				if (stillSelected !== contractId) return

				if (code) {
					formikRef.current?.setFieldValue('code', code.slice(0, 100), false)
				}
				// code null bo'lsa — submit paytida baribir fallback bor
			})
			.finally(() => {
				if (!cancelled) setCodeLoading(false)
			})

		return () => {
			cancelled = true
		}
	}, [previewValues.contract]) // ✅ faqat contract qiymati

	// React PDF blob
	const buildPaymentNoticePdfBlobReactPdf = async (
		values: FormModel,
		companyData: CompanyPayload | null,
		contractData: CurrentRequestContract | null
	): Promise<Blob> => {
		const instance = pdf(
			<DemandLetterPdf values={values} companyData={companyData} contractData={contractData} />
		)

		return await instance.toBlob()
	}

	/* =================== CANCEL (confirm modal bilan) =================== */
	const handleCancelMouseDown = (e: React.MouseEvent) => {
		e.preventDefault()
		e.stopPropagation()
	}

	const handleCancelClick = (e?: React.MouseEvent) => {
		e?.preventDefault()
		e?.stopPropagation()

		const isDirty = !!formikRef.current?.dirty
		if (isDirty) {
			setConfirmOpen(true)
			return
		}

		if (isNavigating) return
		setIsNavigating(true)
		formikRef.current?.setSubmitting(false)
		Promise.resolve().then(() => {
			navigate('/requests/current', { replace: true })
		})
	}

	const confirmCancel = () => {
		setConfirmOpen(false)
		if (isNavigating) return
		setIsNavigating(true)
		formikRef.current?.setSubmitting(false)
		Promise.resolve().then(() => {
			navigate('/requests/current', { replace: true })
		})
	}

	const closeConfirm = () => setConfirmOpen(false)

	/* =================== SAVE (validate + submit) =================== */
	const handleSave = async (e?: React.MouseEvent) => {
		e?.preventDefault()
		e?.stopPropagation()

		if (isCreating || isSaving) return
		setIsSaving(true)

		const f = formikRef.current
		if (!f) {
			setIsSaving(false)

			return
		}

		const errors = await f.validateForm()
		if (Object.keys(errors).length) {
			const touchedAll = Object.keys(f.values).reduce(
				(acc, k) => {
					;(acc as any)[k] = true

					return acc
				},
				{} as Record<string, boolean>
			)
			f.setTouched(touchedAll, true)
			toast.push(
				<Notification type='danger' title={t('Заполните обязательные поля')} duration={2000} />,
				{ placement: 'top-center' }
			)
			setIsSaving(false)

			return
		}

		await f.submitForm()
		setIsSaving(false)
	}

	return (
		<div className='grid grid-cols-1 gap-4 lg:grid-cols-[1fr_373px]'>
			<RequestAddFormPreview
				values={previewValues}
				companyData={companyData}
				contractData={contractData}
			/>

			{/* PDF uchun yashirin sahifa — A4 eni (~794px @96dpi) */}
			<div style={{ position: 'absolute', left: -99999, top: 0 }}>
				<div ref={pdfRef} id='pdf-capture'>
					<PDFViewer style={{ width: '100%', height: 600 }}>
						<DemandLetterPdf
							values={previewValues}
							companyData={companyData}
							contractData={contractData}
						/>
					</PDFViewer>
				</div>
			</div>

			<AdaptableCard className='h-full p-4' bodyClass='h-full'>
				<CurrentRequestForm
					ref={formikRef}
					values={DEFAULT_VALUES}
					isSubmitting={isCreating || isSaving}
					onValuesChange={setPreviewValues}
					onCompanyDataChange={setCompanyData}
					onContractDataChange={setContractData}
					onSubmitComplete={async (values) => {
						// 1) contract PK id
						const contractId = toNumberOrNull(values.contract) ?? readNumberLike(contractData, 'id')

						if (contractId == null) {
							toast.push(
								<Notification
									type='danger'
									title={t('Выберите договор (contract)!')}
									duration={2000}
								/>,
								{ placement: 'top-center' }
							)

							return
						}

						// 2) code — agar formda bo‘lsa o‘shal, bo‘sh bo‘lsa API’dan olib, bo‘lmasa fallback
						let codeFromApi: string | null = null
						const formCode = String(values.code ?? '').trim()
						if (!formCode) {
							try {
								const { code } = await fetchNextCode(contractId)
								codeFromApi = (code || '').trim()
							} catch {
								// jim: fallback bor
							}
						}
						const fallbackCode =
							readStringLike(contractData, 'contract_code') || formCode || `NOTICE-${Date.now()}`
						const code = (codeFromApi || fallbackCode).slice(0, 100)

						// 3) qolgan maydonlar
						const rawPhone =
							String(values.phone_number ?? '').trim() ||
							readStringLike(contractData, 'client_phone_number')
						const digits = rawPhone.replace(/\D/g, '')
						const phone_number =
							digits.length === 12 && digits.startsWith('998')
								? digits
								: digits.length === 9
									? `998${digits}`
									: digits

						const company_name =
							(values.company_name || '').trim() ||
							String(companyData?.['Наименование'] ?? '').trim()

						const stir = (values.stir || '').trim() || String(companyData?.['ИНН'] ?? '').trim()

						const overdue_amount = String(
							values.overdue_amount ?? (contractData as any)?.overdue_amount ?? '0'
						)

						const tech_name =
							(values.tech_name || '').trim() ||
							readStringLike(contractData, 'tech_name') ||
							readStringLike(contractData, 'tech') ||
							null

						const address =
							(values.address || '').trim() ||
							readStringLike(contractData, 'address') ||
							readStringLike(contractData, 'customer_address') ||
							readStringLike(contractData, 'client_address') ||
							null

						// 4) PDF blob
						const pdfBlob = await buildPaymentNoticePdfBlobReactPdf(
							values,
							companyData,
							contractData
						)

						// 5) FormData
						const fd = new FormData()
						fd.append('code', code)
						fd.append('contract', String(contractId))
						fd.append('company_name', company_name)
						fd.append('stir', stir)
						if (tech_name != null) fd.append('tech_name', tech_name)
						if (address != null) fd.append('address', address)
						fd.append('phone_number', phone_number)
						fd.append('overdue_amount', overdue_amount)
						if (pdfBlob) {
							const dateStr = new Date().toLocaleDateString('ru-RU').replace(/\./g, '-')
							const pdfFileName = `Talabnoma-№${code}-${dateStr}.pdf`
							fd.append('pdf_document', pdfBlob, pdfFileName)
						}

						await createPaymentNotice(fd)
					}}
				/>

				<div className='mt-6 w-full text-right'>
					<Button
						type='button'
						className='mr-2'
						onMouseDown={handleCancelMouseDown}
						onClick={handleCancelClick}
						disabled={isNavigating}
					>
						{codeLoading ? t('Загрузка кода…') : t('Отмена')}
					</Button>
					<Button
						type='button'
						variant='solid'
						onClick={handleSave}
						disabled={isCreating || isSaving}
					>
						{isCreating || isSaving ? t('Сохранение…') : t('Сохранить')}
					</Button>
				</div>
			</AdaptableCard>

			{/* =================== Confirm Popup =================== */}
			{confirmOpen && (
				<div
					className='animate-fadeIn fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm'
					onMouseDown={(e) => e.stopPropagation()}
				>
					<div className='animate-slideUp w-full max-w-md transform rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900'>
						<h3 className='mb-2 text-lg font-semibold'>Отменить изменения?</h3>
						<p className='mb-6 text-sm text-gray-600 dark:text-gray-300'>
							{t('Несохранённые данные будут потеряны. Вы действительно хотите выйти?')}
						</p>
						<div className='flex justify-end gap-2'>
							<Button type='button' onClick={closeConfirm}>
								{t('Продолжить')}
							</Button>
							<Button type='button' variant='solid' onClick={confirmCancel}>
								{t('Да, отменить')}
							</Button>
						</div>
					</div>
				</div>
			)}
			{/* ===================================================== */}
		</div>
	)
}

export default CurrentAdd
