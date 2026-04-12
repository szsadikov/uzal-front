// DemandLetterPdf.tsx
import { Document, Font, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import type { CurrentRequestContract } from '@/@types/contract.types'
import TNR from '@/assets/fonts/times.ttf?url'
import TNRB from '@/assets/fonts/timesbd.ttf?url'
import { LOGO_DATA_URL } from '@/assets/logoDataUrl'
// import { formatPrice } from '@/utils/format'
import type { CompanyPayload, FormModel } from '../form/CurrentRequestForm'

// ⚠️ Kirill/lotin ko‘p belgilarini to‘g‘ri chiqarish uchun shrift ro‘yxatdan o‘tkazamiz:
// Font.register({
// 	family: 'TimesNewRoman',
// 	fonts: [
// 		{ src: '/src/assets/fonts/times.ttf', fontWeight: 'normal' },
// 		{ src: '/src/assets/fonts/timesbd.ttf', fontWeight: 'bold' },
// 	],
// })

Font.register({
	family: 'TimesNewRoman',
	fonts: [
		{ src: TNR, fontWeight: 'normal' },
		{ src: TNRB, fontWeight: 'bold' }
	]
})

const styles = StyleSheet.create({
	page: {
		paddingTop: 28,
		paddingBottom: 20,
		paddingHorizontal: 30,
		fontFamily: 'TimesNewRoman',
		fontSize: 11,
		lineHeight: 1.35,
		color: '#101828'
	},
	row: { flexDirection: 'row', alignItems: 'center' },
	center: { textAlign: 'center' as const },
	bold: { fontWeight: 'bold' as const },
	hrThick: { height: 3, backgroundColor: '#1f4e79', marginTop: 6 },
	hrThin: { height: 1, backgroundColor: '#1f4e79', marginTop: 3 },
	mt: { marginTop: 8 },
	mt16: { marginTop: 12 },
	mt20: { marginTop: 14 },
	mt24: { marginTop: 16 },
	justify: { textAlign: 'justify' as const, lineHeight: 1.4 }
})

const UZ_UNITS = ['нол', 'бир', 'икки', 'уч', 'тўрт', 'беш', 'олти', 'етти', 'саккиз', 'тўққиз']
const UZ_TENS = [
	'',
	'ўн',
	'йигирма',
	'ўттиз',
	'қирқ',
	'эллик',
	'олтмиш',
	'етмиш',
	'саксон',
	'тоқсон'
]
const UZ_HUNDS = [
	'',
	'юз',
	'икки юз',
	'уч юз',
	'тўрт юз',
	'беш юз',
	'олти юз',
	'етти юз',
	'саккиз юз',
	'тўққиз юз'
]
const UZ_GROUPS = ['', 'минг', 'миллион', 'миллиард', 'триллион']

const chunkToWordsUZ = (n: number): string => {
	const h = Math.floor(n / 100),
		last2 = n % 100,
		t = Math.floor(last2 / 10),
		u = last2 % 10
	const parts: string[] = []
	if (h) parts.push(UZ_HUNDS[h])
	if (last2 > 0 && last2 < 10) parts.push(UZ_UNITS[last2])
	else if (last2 >= 10 && last2 < 20) parts.push(last2 === 10 ? 'ўн' : `ўн ${UZ_UNITS[last2 - 10]}`)
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
const normalizeNum = (raw: any): number | null => {
	if (raw === null || raw === undefined || raw === '') return null
	if (typeof raw === 'number') return isFinite(raw) ? raw : null
	const n = Number(String(raw).replace(/\s/g, '').replace(',', '.'))

	return isFinite(n) ? n : null
}
const spellSom = (raw: any): string => {
	const n = normalizeNum(raw)
	if (n === null) return '—'
	const som = Math.floor(n + 1e-9),
		tiyin = Math.round((n - som) * 100)

	return `${numberToUzWords(som)} сўм${tiyin ? ` ${numberToUzWords(tiyin)} тийин` : ''}`
}
const pickAmount = (...xs: any[]) =>
	xs.find((v: any) => v !== null && v !== undefined && v !== '') ?? '0'

// Tiyinni ham ko'rsatadigan format: 2 421 184,25
const formatPriceWithTiyin = (raw: any): string => {
	const n = normalizeNum(raw)
	if (n === null) return '—'
	const som = Math.floor(n + 1e-9)
	const tiyin = Math.round((n - som) * 100)
	const somStr = som.toLocaleString('ru-RU') // minglik ajratgich bo'sh joy
	if (tiyin > 0) return `${somStr},${String(tiyin).padStart(2, '0')}`
	return somStr
}

const uzLatin = [
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
const uzCyr = [
	'январ',
	'феврал',
	'март',
	'апрел',
	'май',
	'июн',
	'июл',
	'август',
	'сентябр',
	'октябр',
	'ноябр',
	'декабр'
]

const formatHeaderDate = (d = new Date()) => {
	const y = d.getFullYear(),
		DD = String(d.getDate()).padStart(2, '0'),
		m = uzLatin[d.getMonth()]

	return `${y}-yil “${DD}” ${m}`
}
const formatBodyFirstOfMonth = (d = new Date()) => {
	const y = d.getFullYear(),
		m = uzCyr[d.getMonth()]

	return `${y} йилнинг “01” ${m}`
}
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
	return cd.branch_name || cd.branch?.name || cd.branch_region_name || 'Toshkent viloyat filiali'
}

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
const pickTechName = (values: FormModel, cd?: any): string =>
	(values.tech_name || '').trim() || cd?.tech_name || cd?.tech || '—'

type Props = {
	values: FormModel
	companyData?: CompanyPayload | null
	contractData?: CurrentRequestContract | null
	logoDataUrlOverride?: string
}

export default function DemandLetterPdf({
																					values,
																					companyData,
																					contractData,
																					logoDataUrlOverride
																				}: Props) {
	const overdueRaw = pickAmount(contractData?.overdue_amount, values.overdue_amount)
	const overdue = formatPriceWithTiyin(overdueRaw)
	const overdueText = spellSom(contractData?.overdue_amount ?? values.overdue_amount)
	const logoSrc = logoDataUrlOverride || LOGO_DATA_URL
	const contract_code = (contractData?.contract_code ?? values.code) || '___________________'
	const branchName = pickBranchName(contractData)
	const headerDate = formatHeaderDate(new Date())
	const firstOfMonth = formatBodyFirstOfMonth(new Date())
	const address = pickAddress(values, contractData, companyData)
	const techName = pickTechName(values, contractData)

	return (
		<Document>
			<Page size='A4' style={styles.page}>
				{/* Shapka */}
				<View style={[styles.row, { justifyContent: 'space-between' }]}>
					<View style={{ width: '40%' }}>
						<Text style={[styles.center, styles.bold, { color: '#1f4e79' }]}>
							O‘ZBEKISTON RESPUBLIKASI
						</Text>
						<Text style={[styles.center, styles.bold, { color: '#1f4e79', marginTop: 2 }]}>
							“O‘ZAGROLIZING”
						</Text>
						<Text style={[styles.center, styles.bold, { color: '#1f4e79', marginTop: 2 }]}>
							AKSIYADORLIK JAMIYATI
						</Text>
						<Text style={[styles.center, { marginTop: 6 }]}>{branchName}</Text>
						<Text style={[styles.center, { marginTop: 6 }]}>
							100100, Toshkent sh., Bobur ko‘chasi 42-a, Tel.: 71 207-30-53, Faks: 71 207-30-53,
							toshzilizing@exat.uz
						</Text>
					</View>
					<View style={{ width: 80, alignItems: 'center', justifyContent: 'center' }}>
						<Image src={logoSrc} style={{ width: 80, height: 80 }} />
					</View>
					<View style={{ width: '40%' }}>
						<Text style={[styles.center, styles.bold, { color: '#1f4e79' }]}>
							REPUBLIC OF UZBEKISTAN
						</Text>
						<Text style={[styles.center, styles.bold, { color: '#1f4e79', marginTop: 2 }]}>
							“UZAGROLEASING”
						</Text>
						<Text style={[styles.center, styles.bold, { color: '#1f4e79', marginTop: 2 }]}>
							JOINT STOCK COMPANY
						</Text>
						<Text style={[styles.center, { marginTop: 6 }]}>{branchName}</Text>
						<Text style={[styles.center, { marginTop: 6 }]}>
							42a, Bobur street, Tashkent, 100100, Phone: (+99871) 207-30-53, Fax: (+99871)
							207-30-53
						</Text>
					</View>
				</View>

				<View style={styles.hrThick} />
				<View style={styles.hrThin} />

				{/* Sana / № */}
				<View style={[styles.row, { justifyContent: 'space-between' }, styles.mt16]}>
					<Text>{headerDate}</Text>
					<Text>№ {contract_code}</Text>
				</View>

				{/* Qabul qiluvchi */}
				<View style={[{ alignItems: 'flex-end' }, styles.mt20]}>
					<Text style={styles.bold}>“{values.company_name || 'КОМПАНИЯ НОМИ'}” ф/л</Text>
					<Text style={styles.bold}>рахбарига</Text>
				</View>

				{/* Sarlavha */}
				<View style={[{ alignItems: 'center' }, styles.mt24]}>
					<Text style={[styles.bold]}>T A L A B N O M A</Text>
				</View>

				{/* Matn */}
				<View style={[styles.mt16]}>
					<Text style={styles.justify}>
						“Ўзагролизинг” АЖ {branchName} ва {address}даги “
						{values.company_name || 'КОМПАНИЯ НОМИ'}” ф/л ўртасида тузилган{' '}
						<Text style={styles.bold}>{contract_code}</Text>–сонли лизинг шартномага асосан 1 (бир) дона
						“{techName}” русумли қишлоқ хўжалик техникаси ҳужжатлари билан етказиб берилган.
					</Text>

					<Text style={[styles.justify, styles.mt]}>
						Бироқ, “{values.company_name || 'КОМПАНИЯ НОМИ'}” ф/л томонидан қонун талаблари ва
						шартнома шартларига зид равишда лизинг тўловларининг белгиланган график бўйича ўз
						муддатида ва миқдорда тўланмаганлиги оқибатида{' '}
						<Text style={styles.bold}>{firstOfMonth}</Text> ҳолатига асосий қарздорлик ва пенядан{' '}
						<Text style={styles.bold}>{overdue}</Text> ({overdueText}) сўм миқдорда қарздoрлик ҳосил
						бўлган.
					</Text>

					<Text style={[styles.justify, styles.mt]}>
						Лизинг шартномасининг 12.2–бандига кўра, лизинг берувчи, лизинг олувчининг ўзича расмий
						огоҳлантирган ҳолда унга ўз мажбуриятларини бажариш учун{' '}
						<Text style={styles.bold}>15 кунлик</Text> муддат берганидан сўнг ҳам мажбурият
						бажарилмаган тақдирда, лизинг олувчини расмий огоҳлантирган ҳолда шартнома мажбуриятини
						бажарилмаган бир томонлама бекор қилиш ҳуқуқига эга эканлиги белгиланган.
					</Text>

					<Text style={[styles.justify, styles.mt]}>
						Ўзбекистон Республикасининг “Хўжалик юритувчи субъектлар фаолиятининг
						шартномавий–ҳуқуқий базаси тўғрисида”ги Қонуннинг 32–моддасига кўра, етказиб берилган
						товарлар қиймати ўз вақтида тўланмаганлиги учун сотиб олувчи (буюртмачи) етказиб
						берувчига ўзлаштирилмаган ҳар бир кун учун кечиктирилган тўлов суммасининг{' '}
						<Text style={styles.bold}>0,4 фоизи</Text> миқдорда, аммо неустойканинг жами тўлов
						суммасининг <Text style={styles.bold}>50 фоизидан ортиқ бўлмаган</Text> миқдорда пеня
						тўлайди.
					</Text>

					<Text style={[styles.justify, styles.mt]}>
						Юқоридагиларга асосан, Сиздан <Text style={styles.bold}>15 (ўн беш)</Text> кунлик муддат
						ичида
						<Text style={styles.bold}> {overdue}</Text> ({overdueText}) сўм миқдордаги қарздорликни
						тўлаб беришиингизни сўраймиз.
					</Text>

					<Text style={[styles.justify, styles.mt]}>
						Акс ҳолда, лизинг шартномаларини бир тарафлама бекор қилиб, лизинг объектни қайтариб
						олиниши, асосий қарз ва суммасини кечиктирилган ҳар бир кун учун{' '}
						<Text style={styles.bold}>0,4%</Text>дан пеня ундирилиши ҳамда бошқа қонуний талаблар
						билан судга мурожаат қилиниши маълум қилинади.
					</Text>
				</View>

				{/* Imzo */}
				<View style={[styles.row, { justifyContent: 'space-between' }, { marginTop: 40 }]}>
					<Text style={styles.bold}>{values.jurist_role || 'Bosh yuriskonsult'}</Text>
					<Text style={styles.bold}>{values.jurist_full_name || 'A.Berdiev'}</Text>
				</View>

				<View style={{ marginTop: 28 }}>
					<Text>Tel: {values.jurist_phone || '90-371-15-10'}</Text>
				</View>
			</Page>
		</Document>
	)
}
