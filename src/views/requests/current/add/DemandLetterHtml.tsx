// src/pages/.../DemandLetterHtml.tsx
import './demand-letter.css'

import type { CurrentRequestContract } from '@/@types/contract.types'
import { LOGO_DATA_URL } from '@/assets/logoDataUrl' // data:image/png;base64,...
// import { formatPrice } from '@/utils/format'
import type { CompanyPayload, FormModel } from '../form/CurrentRequestForm'

// ==== Helpers (krillcha → lotin) ====
const normalizeNum = (raw: string | number | null | undefined): number | null => {
	if (raw === null || raw === undefined || raw === '') return null
	if (typeof raw === 'number') return isFinite(raw) ? raw : null
	const n = Number(String(raw).replace(/\s/g, '').replace(',', '.'))

	return isFinite(n) ? n : null
}

const UZ_UNITS = ['nol', 'bir', 'ikki', 'uch', 'to‘rt', 'besh', 'olti', 'yetti', 'sakkiz', 'to‘qqiz']
const UZ_TENS = [
	'',
	'o‘n',
	'yigirma',
	'o‘ttiz',
	'qirq',
	'ellik',
	'oltmish',
	'yetmish',
	'sakson',
	'to‘qson'
]
const UZ_HUNDS = [
	'',
	'yuz',
	'ikki yuz',
	'uch yuz',
	'to‘rt yuz',
	'besh yuz',
	'olti yuz',
	'yetti yuz',
	'sakkiz yuz',
	'to‘qqiz yuz'
]
const UZ_GROUPS = ['', 'ming', 'million', 'milliard', 'trillion']

const chunkToWordsUZ = (n: number): string => {
	const h = Math.floor(n / 100),
		last2 = n % 100,
		t = Math.floor(last2 / 10),
		u = last2 % 10
	const parts: string[] = []
	if (h) parts.push(UZ_HUNDS[h])
	if (last2 > 0 && last2 < 10) parts.push(UZ_UNITS[last2])
	else if (last2 >= 10 && last2 < 20) parts.push(last2 === 10 ? 'o‘n' : `o‘n ${UZ_UNITS[last2 - 10]}`)
	else {
		if (t) parts.push(UZ_TENS[t])
		if (u) parts.push(UZ_UNITS[u])
	}

	return parts.join(' ')
}

const numberToUzWords = (num: number): string => {
	if (num === 0) return UZ_UNITS[0]
	const parts: string[] = []
	let g = 0
	while (num > 0 && g < UZ_GROUPS.length) {
		const chunk = num % 1000
		if (chunk) parts.unshift([chunkToWordsUZ(chunk), UZ_GROUPS[g]].filter(Boolean).join(' '))
		num = Math.floor(num / 1000)
		g++
	}

	return parts.join(' ')
}

const spellSom = (raw: string | number | null | undefined): string => {
	const n = normalizeNum(raw)
	if (n === null) return '—'
	const som = Math.floor(n + 1e-9),
		tiyin = Math.round((n - som) * 100)

	return `${numberToUzWords(som)} so‘m${tiyin ? ` ${numberToUzWords(tiyin)} tiyin` : ''}`
}

const pickAmount = (...xs: Array<string | number | null | undefined>) =>
	xs.find((v): v is string | number => v !== null && v !== undefined && v !== '') ?? '0'

const formatPriceWithTiyin = (raw: string | number | null | undefined): string => {
	const n = normalizeNum(raw)
	if (n === null) return '—'
	const som = Math.floor(n + 1e-9)
	const tiyin = Math.round((n - som) * 100)
	const somStr = som.toLocaleString('ru-RU')
	if (tiyin > 0) return `${somStr},${String(tiyin).padStart(2, '0')}`

	return somStr
}

const uzMonthsLatin = [
	'yanvar',
	'fevral',
	'mart',
	'aprel',
	'may',
	'iyun',
	'iyul',
	'avgust',
	'sentabr',
	'oktabr',
	'noyabr',
	'dekabr'
]

// avval krillcha edi – endi lotin, nomini o‘zgartirmadim, faqat qiymatlar
const uzMonthsCyr = [
	'yanvar',
	'fevral',
	'mart',
	'aprel',
	'may',
	'iyun',
	'iyul',
	'avgust',
	'sentabr',
	'oktabr',
	'noyabr',
	'dekabr'
]

const formatHeaderDate = (d = new Date()) => {
	const y = d.getFullYear()
	const DD = String(d.getDate()).padStart(2, '0')
	const m = uzMonthsLatin[d.getMonth()]

	return `${y}-yil “${DD}” ${m}`
}

// Matn ichidagi “YYYY yilning “01” oy”
const formatBodyFirstOfMonth = (d = new Date()) => {
	const y = d.getFullYear()
	const m = uzMonthsCyr[d.getMonth()]

	return `${y} yilning “01” ${m}`
}

// contractData dan filial nomini olish — lotin/uzl ni ustun qo'yamiz
const pickBranchName = (cd?: any): string => {
	if (!cd) return 'Toshkent viloyat filiali'

	// Lotin harfli variantlarni birinchi tekshiramiz
	const latinName =
		cd.branch?.region?.name_uzl ||
		cd.branch?.region?.name_latin ||
		cd.branch?.region?.name_uz1 ||
		cd.branch?.name_latin ||
		cd.branch?.name_uzl

	if (latinName) return latinName + ' filiali'

	// Fallback: mavjud maydonlar (Kirill bo'lishi mumkin)
	return (
		cd.branch_name || cd.branch?.name || cd.branch_region_name || 'Toshkent viloyat filiali'
	)
}

// address va tech_name ni values’dan olib, contractData’dan fallback
const pickAddress = (values: FormModel, cd?: any, company?: CompanyPayload | null): string => {
	const v = (values.address || '').trim()
	if (v) return v

	return (
		cd?.address ||
		cd?.customer_address ||
		cd?.client_address ||
		(company && typeof company['Адрес'] === 'string' ? (company['Адрес'] as string) : '') ||
		'—'
	)
}
const pickTechName = (values: FormModel, cd?: any): string => {
	const v = (values.tech_name || '').trim()
	if (v) return v

	return cd?.tech_name || cd?.tech || '—'
}

// ==== Component ====
type Props = {
	values: FormModel
	companyData?: CompanyPayload | null
	contractData?: CurrentRequestContract | null
	logoDataUrlOverride?: string
	// Yurist ma'lumotlari — FormModel dan olinadi, lekin Props dan ham qabul qilinadi
}

export default function DemandLetterHtml({
																					 values,
																					 companyData,
																					 contractData,
																					 logoDataUrlOverride
																				 }: Props) {
	const overdueRaw = pickAmount(contractData?.overdue_amount, values.overdue_amount)
	const overdue = formatPriceWithTiyin(overdueRaw)
	const overdueText = spellSom(contractData?.overdue_amount ?? values.overdue_amount)

	const logoSrc = logoDataUrlOverride || LOGO_DATA_URL
	const contract_code = contractData?.contract_code ?? values.code
	const branchName = pickBranchName(contractData)
	const headerDate = formatHeaderDate(new Date())
	const firstOfMonth = formatBodyFirstOfMonth(new Date())

	// Yangi maydonlar
	const address = pickAddress(values, contractData, companyData)
	const techName = pickTechName(values, contractData)

	return (
		<div
			style={{
				color: '#101828',
				padding: 88,
				marginBottom: 4,
				fontFamily: '"Times New Roman", Times, serif',
				fontSize: 14,
				lineHeight: 1.5
			}}
		>
			{/* Shapka */}
			<div
				style={{
					display: 'grid',
					gridTemplateColumns: '1fr 100px 1fr',
					alignItems: 'center',
					columnGap: 16
				}}
			>
				<div style={{ textAlign: 'center' }}>
					<div style={{ fontWeight: 'bold', color: '#1f4e79' }}>O‘ZBEKISTON RESPUBLIKASI</div>
					<div style={{ fontWeight: 'bold', color: '#1f4e79', marginTop: 2 }}>“O‘ZAGROLIZING”</div>
					<div style={{ fontWeight: 'bold', color: '#1f4e79', marginTop: 2 }}>
						AKSIYADORLIK JAMIYATI
					</div>
					<div style={{ marginTop: 6 }}>{branchName}</div>
					<div style={{ marginTop: 6 }}>
						100100, Toshkent sh., Bobur ko‘chasi 42-a, Tel.: 71 207-30-53, Faks: 71 207-30-53,
						toshzilizing@exat.uz
					</div>
				</div>
				<div style={{ display: 'flex', justifyContent: 'center' }}>
					<img
						src={logoSrc}
						alt='UZA Logo'
						style={{ width: 80, height: 80, objectFit: 'contain' }}
					/>
				</div>
				<div style={{ textAlign: 'center' }}>
					<div style={{ fontWeight: 'bold', color: '#1f4e79' }}>REPUBLIC OF UZBEKISTAN</div>
					<div style={{ fontWeight: 'bold', color: '#1f4e79', marginTop: 2 }}>“UZAGROLEASING”</div>
					<div style={{ fontWeight: 'bold', color: '#1f4e79', marginTop: 2 }}>
						JOINT STOCK COMPANY
					</div>
					<div style={{ marginTop: 6 }}>{branchName}</div>
					<div style={{ marginTop: 6 }}>
						42a, Bobur street, Tashkent, 100100, Phone: (+99871) 207-30-53, Fax: (+99871) 207-30-53
					</div>
				</div>
			</div>

			<div style={{ marginTop: 8, borderBottom: '3px solid #1f4e79' }} />
			<div style={{ marginTop: 4, borderBottom: '1px solid #1f4e79' }} />

			{/* Sana / № */}
			<div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
				<div>{headerDate}</div>
				<div>№ {contract_code || '___________________'}</div>
			</div>

			{/* Qabul qiluvchi */}
			<div style={{ marginTop: 20, textAlign: 'right' }}>
				<div style={{ fontWeight: 'bold' }}>“{values.company_name || 'KOMPANIYA NOMI'}” f/l</div>
				<div style={{ fontWeight: 'bold' }}>rahbariga</div>
				{/*<div style={{ fontStyle: 'italic' }}>(Manzil: {address})</div>*/}
			</div>

			{/* Sarlavha */}
			<div style={{ textAlign: 'center', fontWeight: 'bold', marginTop: 24, letterSpacing: 1 }}>
				T A L A B N O M A
			</div>

			{/* Matn – hammasi lotincha */}
			<div
				style={{
					fontFamily: '"Times New Roman", Times, serif',
					fontSize: 14,
					lineHeight: 1.5,
					textAlign: 'justify',
					backgroundColor: '#FFF'
				}}
			>
				<p>
					“O‘zagrolizing” AJ Toshkent viloyat filiali va {address}dagi “
					{values.company_name || 'KOMPANIYA NOMI'}” f/l o‘rtasida 05.03.2024 yilda tuzilgan{' '}
					<b>{contract_code}</b>-sonli lizing shartnomaga asosan 1 (bir) dona “<i>{techName}</i>” rusumli
					qishloq xo‘jalik texnikasi hujjatlari bilan yetkazib berilgan.
				</p>

				<p>
					Biroq, “{values.company_name || 'KOMPANIYA NOMI'}” f/l tomonidan qonun talablariga va
					shartnoma shartlariga zid ravishda lizing to‘lovlarining belgilangan grafik bo‘yicha o‘z
					muddatida va miqdorda to‘lanmaganligi oqibatida <b>{firstOfMonth}</b> holatiga asosiy
					qarzdorlik va penyadan <b>{overdue}</b> (<i>{overdueText}</i>) so‘m miqdorda qarzdorlik
					vujudga kelgan.
				</p>

				<p>
					Lizing shartnomasining 12.2-bandiga ko‘ra, lizing beruvchi, lizing oluvchini o‘z vaqtida
					rasman ogohlantirgan holda unga o‘z majburiyatlarini bajarish uchun <b>15 kunlik</b> muddat
					bergandan so‘ng ham majburiyat bajarilmagan taqdirda, lizing oluvchini rasman ogohlantirgan
					holda shartnoma majburiyatini bajarilmagan holda bir tomonlama bekor qilish huquqiga ega
					ekanligi belgilangan.
				</p>

				<p>
					O‘zbekiston Respublikasining “Xo‘jalik yurituvchi subyektlar faoliyatining shartnomaviy–
					huquqiy bazasi to‘g‘risida”gi Qonunining 32-moddasiga ko‘ra, yetkazib berilgan
					tovarlarning qiymati o‘z vaqtida to‘lanmaganligi uchun sotib oluvchi (buyurtmachi) yetkazib
					beruvchiga o‘zlashtirilmagan har bir kun uchun kechiktirilgan to‘lov summasining{' '}
					<b>0,4 foizi</b> miqdorda, biroq neustoykaning jami to‘lov summasining{' '}
					<b>50 foizidan ortiq bo‘lmagan</b> miqdorda penya to‘laydi.
				</p>

				<p>
					Yuoqoridagilarga asosan, Sizdan <b>15 (o‘n besh)</b> kunlik muddat ichida <b>{overdue}</b> (
					<i>{overdueText}</i>) so‘m miqdordagi qarzdorlikni to‘lab berishingizni so‘raymiz.
				</p>

				<p>
					Aks holda, lizing shartnomalarini bir tomonlama bekor qilib, lizing obyektini qaytarib
					olinishi, asosiy qarz summasini kechiktirilgan har bir kun uchun <b>0,4%</b>dan penya
					undirilishi hamda boshqa qonuniy talablar bilan sudga murojaat qilinishi ma’lum qilinadi.
				</p>
			</div>

			{/* Imzo */}
			<div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 40 }}>
				<div style={{ fontWeight: 'bold' }}>
					{values.jurist_role || 'Bosh yuriskonsult'}
				</div>
				<div style={{ fontWeight: 'bold' }}>
					{values.jurist_full_name || 'A.Berdiev'}
				</div>
			</div>

			<div style={{ marginTop: 28 }}>
				<div>Tel: {values.jurist_phone || '90-371-15-10'}</div>
			</div>
		</div>
	)
}
