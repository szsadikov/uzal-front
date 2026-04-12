import { Document, Font, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import { Customer, DefaultContract } from '@/@types/contract.types'
import { ConstMetric } from '@/@types/dataset.types'
import { Tech } from '@/@types/tech.types'
import { formatDate, formatPrice, numToWordUz } from '@/utils/format'
import { FormModel, PaymentRow } from './NewContractsAdd'

type Props = {
	values: FormModel
	contract?: DefaultContract
	customer?: Customer
	metric?: ConstMetric
	tech?: Tech | null
	tableData?: PaymentRow[] | null
	totals?: {
		totalPrincipal: number
		totalInterest: number
		totalAmount: number
	} | null
}

Font.register({
	family: 'Times',
	fonts: [
		{
			src: '/fonts/Times-New-Roman.ttf',
			fontWeight: 'normal',
			fontStyle: 'normal'
		},
		{
			src: '/fonts/Times-New-Roman-Italic.ttf',
			fontWeight: 'normal',
			fontStyle: 'italic'
		},
		{
			src: '/fonts/Times-New-Roman-Bold.ttf',
			fontWeight: 'bold',
			fontStyle: 'normal'
		},
		{
			src: '/fonts/Times-New-Roman-Bold-Italic.ttf',
			fontWeight: 'bold',
			fontStyle: 'italic'
		}
	]
})

// Отключаем дефисы при переносе строк
Font.registerHyphenationCallback((word) => [word])

const styles = StyleSheet.create({
	page: {
		position: 'relative',
		fontFamily: 'Times',
		fontWeight: 'normal',
		fontSize: 10,
		lineHeight: 1.4,
		textAlign: 'justify',
		color: '#101828',
		padding: 24
	},
	title: {
		fontFamily: 'Times',
		fontWeight: 'bold',
		lineHeight: 1,
		textAlign: 'center',
		textTransform: 'uppercase',
		marginBottom: 4
	},
	pageNumber: {
		position: 'absolute',
		bottom: 8,
		left: 0,
		right: 0,
		fontWeight: 700,
		fontSize: 10,
		textAlign: 'center'
	},

	table: {
		width: '100%',
		borderWidth: 1,
		borderColor: '#000',
		borderStyle: 'solid'
	},
	row: {
		flexDirection: 'row'
	},
	cell: {
		justifyContent: 'center',
		borderRightWidth: 1,
		borderRightColor: '#000',
		borderBottomWidth: 1,
		borderBottomColor: '#000',
		padding: 6
	},
	lastCell: {
		borderRightWidth: 0
	},
	headerCell: {
		backgroundColor: '#FFF',
		fontWeight: 600,
		fontSize: 8,
		textTransform: 'uppercase'
	},
	footerCell: {
		backgroundColor: '#FFF',
		borderBottomWidth: 0,
		fontWeight: 600
	},
	col1: { width: '8%' }, // №
	col2: { width: '18%' }, // Остаток займа
	col3: { width: '16%' }, // Дата платежа
	col4: { width: '10%' }, // Дней
	col5: { width: '16%' }, // Основной долг
	col6: { width: '16%' }, // Процент
	col7: { width: '16%' } // Общая сумма
})

const ContractDocument = ({
	values,
	contract,
	customer,
	metric,
	tech,
	tableData,
	totals
}: Props) => {
	return (
		<Document>
			{/* PAGE 1 */}
			<Page size='A4' style={styles.page}>
				<View
					style={{
						flexDirection: 'column',
						alignItems: 'center',
						maxWidth: '82%',
						marginLeft: 'auto',
						marginRight: 'auto',
						marginBottom: 12
					}}
				>
					<Text style={{ fontWeight: 'bold', lineHeight: 0.8, textAlign: 'center' }}>
						{values.code ? values.code : contract ? contract.contract_number : '__/_______'}-sonli
						LIZING SHARTNOMASI
					</Text>

					{values.pkm_top_content && (
						<Text style={{ fontWeight: 'bold', lineHeight: 0.8, textAlign: 'center' }}>
							{values.pkm_top_content.replace(/\n+/g, ' ')}
						</Text>
					)}
				</View>

				<View
					style={{
						flexDirection: 'row',
						alignItems: 'center',
						justifyContent: 'space-between',
						marginBottom: 16
					}}
				>
					<Text style={{ fontWeight: 'bold' }}>
						{values.contract_date
							? `${formatDate(values.contract_date, 'YYYY')}-yil “${formatDate(values.contract_date, 'DD')} ” ${formatDate(values.contract_date, 'MMMM', 'uz-latin')}`
							: '__________________'}
					</Text>
					<Text style={{ fontWeight: 'bold' }}>
						{values.branch_region
							? values.branch_region
							: contract
								? contract.region.name
								: '___________'}
					</Text>
				</View>

				<Text style={{ marginBottom: 12 }}>
					“O‘zagrolizing” AJ Ustavi, Filial to‘g‘risidagi Nizom va Jamiyat tomonidan{' '}
					{values.procuration_date
						? formatDate(values.procuration_date, 'YYYY')
						: contract
							? formatDate(contract.branch.procuration_date, 'YYYY')
							: '____'}
					-yil{' '}
					{values.procuration_date
						? formatDate(values.procuration_date, 'DD')
						: contract
							? formatDate(contract.branch.procuration_date, 'DD')
							: '__'}
					-
					{values.procuration_date
						? formatDate(values.procuration_date, 'MMMM', 'uz-latin')
						: contract
							? formatDate(contract.branch.procuration_date, 'MMMM', 'uz-latin')
							: '______'}{' '}
					{values.code ? values.code : contract ? contract.contract_number : '__/_______'}-sonli
					ishonchnomaga muvofiq, jamiyatning{' '}
					{values.branch_region ? values.branch_region : '_______________________'} filiali (keyingi
					matnda “LIZING BERUVCHI” deb yuritiladi) nomidan Filial direktori{' '}
					<Text style={{ fontWeight: 'bold' }}>
						{values.branch_director
							? values.branch_director
							: contract
								? `${contract.branch.director_first_name} ${contract.branch.director_last_name}`
								: '________________'}
					</Text>{' '}
					bir tomondan va o‘z Ustavi asosida ish yurituvchi{' '}
					<Text style={{ fontWeight: 'bold' }}>
						{customer ? customer.data.Наименование : '___________________________________'}
					</Text>{' '}
					(keyingi matnda “LIZING OLUVCHI” deb yuritiladi) nomidan xo'jalik rahbari{' '}
					{values.client_director ? values.client_director : '_______________________'} ikkinchi
					tomondan, {values.pkm_bottom_content && values.pkm_bottom_content.replace(/\n+/g, ' ')}{' '}
					shartnoma tuzdilar:
				</Text>

				<Text style={styles.title}>1. SHARTNOMA PREDMETI</Text>

				<Text style={{ marginBottom: 12 }}>
					LIZING BERUVCHI{' '}
					<Text style={{ fontWeight: 'bold' }}>
						“{tech ? tech.model_name_uz : '_________________'}” rusumli 1 (bir) dona{' '}
						{tech ? tech.type.name_uz : '_______________________'}
					</Text>{' '}
					(keyingi matnlarda - “LIZING OBYEKTI” deb yuritiladi) LIZING OLUVCHIning tanlovi va
					buyurtmasi (topshirig‘i) asosida{' '}
					<Text style={{ fontWeight: 'bold' }}>
						“{tech ? tech.manufacturer.name_uz : '_________________'}”
					</Text>{' '}
					(bundan keyingi matnda - “SOTUVCHI”)dan LIZING BERUVCHIning o‘z mablag‘lari hisobidan o‘z
					mulki etib sotib oladi va LIZING OLUVCHIga lizingga beradi. LIZING OLUVCHI esa ushbu
					shartnoma shartlari asosida texnikadan foydalanish, egalik qilish, lizing to‘lovlarini
					shartnomada belgilangan muddatlarda to‘lash, lizing to‘lovlari to‘liq to‘langanidan keyin
					texnikaga mulk huquqini o‘ziga qabul qilish majburiyatini oladi.
				</Text>

				<View style={{ marginBottom: 12 }}>
					<Text style={styles.title}>2. LIZING OBYEKTINI RASMIYLASHTIRIB BERISH SHARTLARI</Text>

					<Text>
						2.1. Mazkur shartnoma bo‘yicha LIZING BERUVCHIning LIZING OBYEKTIni lizingga
						rasmiylashtirib berish majburiyati LIZING OLUVCHI tomonidan quyidagi shartlar
						bajarilganidan keyin, ya’ni: LIZING OBYEKTI umumiy qiymatining{' '}
						{metric ? Number(metric.min_deposit_percentage) : '__'} foizi miqdorida oldindan to‘lov
						avans sifatida to‘liq to‘langanidan so‘ng; Lizing to‘lovlari to‘lanishi ta’minoti
						sifatida shartnomaning 5.1-bandi asosida tanlangan ta’minotning bir turi taqdim
						etilganidan so‘ng kelib chiqadi.
					</Text>
					<Text>
						2.2. LIZING OLUVCHI tomonidan shartnomaning 2.1-bandi to‘liq o‘z vaqtida bajarilganidan
						so‘ng va SOTUVCHI LIZING OBYEKTIni LIZING BERUVCHIGA yetkazib berganidan keyin
						2025-yilning 31-dekabr kuniga qadar LIZING OBYEKTI lizingga rasmiylashtirib beriladi.
					</Text>
					<Text>2.3. LIZING OBYEKTIning butligiga quyidagilar kiradi:</Text>
					<Text>- LIZING OBYEKTI;</Text>
					<Text>
						- LIZING OBYEKTIga texnik xizmat ko‘rsatish uchun asbob va uskunalar to‘plami;
					</Text>
					<Text>
						LIZING OBYEKTIning sifati SOTUVCHI tomonidan tasdiqlangan “Texnik shartlar” talabiga
						javob berishi shart. LIZING OLUVCHI LIZING OBYEKTIning sifati va butligini SOTUVCHIdan
						qabul qilish jarayonida tekshirib olishi shart va Tomonlar o‘rtasida “LIZING OBYEKTIni
						topshirish - qabul qilib olish dalolatnomasi” rasmiylashtiriladi.
					</Text>
					<Text>
						2.4. LIZING OBYEKTIni{' '}
						<Text style={{ fontWeight: 'bold' }}>
							LIZING BERUVCHIning nomiga texnik tavsifiga qarab davlat ro‘yxatidan o‘tkazish
						</Text>{' '}
						xarajatlari (ya’ni, davlat raqam belgisi/texnik pasport/guvohnoma olish/dastlabki texnik
						ko‘rik va ro‘yxatga qo‘yish, shu jumladan Vazirlar Mahkamasining 2017-yil 31-avgustdagi
						683-sonli qarori 1-ilovasi bilan tasdiqlangan Nizom asosida auksion orqali avtoraqam
						sotib olish) LIZING BERUVCHIning o‘z mablag‘i hisobidan amalga oshiriladi va ushbu
						xarajatlar LIZING OLUVCHIning avans mablag‘lariga qo‘shib undiriladi.
					</Text>
					<Text>
						LIZING OBYEKTIni lizing shartnomasi davrida texnik ko‘rikdan o‘tkazish va qonunda
						nazarda tutilgan davlat ro‘yxatidan o‘tkazish bilan bog‘liq boshqa majburiyatlar (yangi
						ko‘rinishdagi texnik pasport yoki guvohnoma yoki davlat raqam belgisi joriy etilganda,
						shu jumladan yo‘qotilgan davlat raqam belgisi va texnik pasport o‘rniga yangisini olish
						holatlarida) LIZING OLUVCHIning zimmasida qoldiriladi.
					</Text>
				</View>

				<View style={{ marginBottom: 12 }}>
					<Text style={styles.title}>
						3. SHARTNOMANING UMUMIY SUMMASI, LIZING FOIZI MIQDORI va LIZING MUDDATI
					</Text>

					<Text>
						3.1. LIZING OBYEKTIning narxi (qiymati) SOTUVCHI tomonidan belgilangan bo‘lib,
						texnikaning umumiy qiymati qo‘shilgan qiymat solig‘i bilan birga{' '}
						<Text style={{ fontWeight: 'bold' }}>
							{tech && metric
								? formatPrice(Number(tech.tech_price_with_vat).toFixed(0))
								: '_________'}{' '}
							(
							{tech && metric
								? numToWordUz(Number(tech.tech_price_with_vat).toFixed(0))
								: '_______________'}
							)
						</Text>{' '}
						so‘mni tashkil etadi. IZING OBYEKTIga GPS (global pozitsiyalash tizimi) navigator
						qurilmasini o‘rnatish xarajatlari va barcha abonent to‘lovlari qo‘shilgan qiymat solig‘i
						bilan birga{' '}
						<Text style={{ fontWeight: 'bold' }}>
							{tech && metric
								? formatPrice(
										(
											Number(tech.tech_price_with_vat) +
											Number(metric.gps) * (1 + Number(metric.vat) / 100)
										).toFixed(0)
									)
								: '_________'}{' '}
							(
							{tech && metric
								? numToWordUz(
										(
											Number(tech.tech_price_with_vat) +
											Number(metric.gps) * (1 + Number(metric.vat) / 100)
										).toFixed(0)
									)
								: '_______________'}
							)
						</Text>{' '}
						so‘mni tashkil etadi va ushbu xarajatlar
					</Text>
				</View>

				<View style={styles.pageNumber} fixed>
					<Text style={styles.pageNumber}>1</Text>
				</View>
			</Page>

			{/* PAGE 2 */}
			<Page size='A4' style={styles.page}>
				<Text>avans mablag‘lariga qo‘shib undiriladi.</Text>

				<View style={{ marginBottom: 12 }}>
					<Text>
						3.2. Mazkur shartnomaning umumiy pul summasi LIZING BERUVCHIning LIZING OBYEKTIni
						SOTUVCHIdan sotib olish bilan bog‘liq barcha xarajatlari summasi va unga hisoblangan
						lizing foizining yig‘indisidan iborat hamda ushbu shartnomaning 1-ilovasi (“Lizing
						to‘lovlarini hisoblash va to‘lash jadvali”) da ko‘rsatiladi.
					</Text>
					<Text>
						3.3. “Lizing muddati davrida LIZING BERUVCHIning daromad foizi shartnomaning
						3.5.-bandida ko‘rsatilgan miqdorda belgilanadi va ushbu lizing foizi (marjasi)ning 10
						(o‘n) foiz punktidan ortiq qismi O‘zbekiston Respublikasi Davlat byudjeti mablag‘lari
						hisobiga ajratiladigan O‘zbekiston Respublikasi Moliya vazirligi huzuridagi Qishloq
						xo‘jaligini davlat tomonidan qo‘llab-quvvatlash jamg‘armasi (keyingi o‘rinlarda
						“Jamg‘arma” deb yuritiladi) tomonidan “Qishloq xo‘jaligi texnikasini kredit va lizing
						shartlarida xarid qilishni davlat tomonidan qo‘llab-quvvatlash tartibi to‘g‘risida”gi
						NIZOM hamda “Jamg‘arma” va “LIZING BERUVCHI” o‘rtasida tuzilgan “BOSH BITIM” asosida
						ajratiladigan{' '}
						<Text style={{ fontStyle: 'italic', fontWeight: 'bold' }}>
							subsidiya bilan qoplanib berilishi mumkin. Bunda, lizing foizi (marja)ning qolgan
							qismi LIZING OLUVCHI tomonidan to‘lab beriladi.
						</Text>
					</Text>
					<Text style={{ fontStyle: 'italic' }}>
						“Jamg‘arma” tomonidan subsidiya ajratilmagan hollarda, lizing foizi (marja) LIZING
						OLUVCHI tomonidan to‘liq to‘lab beriladi.
					</Text>
					<Text>
						3.4. “LIZING OLUVCHI” tomonidan shartnomaning to‘lov jadvaliga muvofiq yillik 10 (o‘n)
						foizi (shu jumladan shartnomada belgilangan boshqa lizing to‘lovlari)ni o‘z vaqtida va
						miqdorida to‘lab berilmagan taqdirda, “Jamg‘arma” tomonidan subsidiya ajratilmaydi va
						“LIZING OLUVCHI” shartnomaning 3.5.-bandida belgilangan lizing foizini hamda boshqa
						lizing to‘lovlarini LIZING BERUVCHIga to‘liq to‘lab beradi.
					</Text>
					<Text>
						3.5. Lizing muddati davrida LIZING BERUVCHIning daromad foizi (bundan keyin – “lizing
						foizi” deb yuritiladi){' '}
						<Text style={{ fontWeight: 'bold' }}>
							yillik {values.rent_percent ? values.rent_percent : '__'} (
							{values.rent_percent ? numToWordUz(values.rent_percent) : '_______'}) foiz
						</Text>{' '}
						miqdorida belgilanadi.
					</Text>
					<Text>
						Lizing muddati tugagan kundan boshlab, ushbu kun holatiga ko‘ra asosiy qarzning qoldiq
						summasiga hisoblanadigan{' '}
						<Text style={{ fontWeight: 'bold' }}>
							lizing foizi yillik <Text style={{ textDecoration: 'line-through' }}>27</Text> (
							<Text style={{ textDecoration: 'line-through' }}>yigirma yetti</Text>) foiz
						</Text>{' '}
						miqdorida belgilanadi.
					</Text>
					<Text>
						3.6. Lizing muddati LIZING OBYEKTI LIZING OLUVCHIga “Topshirish-qabul qilish
						dalolatnomasi” asosida topshirilgan kundan boshlab{' '}
						<Text style={{ fontWeight: 'bold' }}>
							{values.rent_period ? values.rent_period : '__'} (
							{values.rent_period ? numToWordUz(values.rent_period) : '_______'}) oylik imtiyozli
							davr bilan <Text style={{ textDecoration: 'line-through' }}>7</Text>(
							<Text style={{ textDecoration: 'line-through' }}>yetti</Text>) yil
						</Text>{' '}
						etib belgilanadi.
					</Text>
				</View>

				<Text style={styles.title}>
					4. AVANS, DAVLAT RO‘YXATIDAN O‘TISH VA LIZING TO‘LOVINI TO‘LASH SHARTLARI
				</Text>

				<View style={{ marginBottom: 12 }}>
					<Text>
						4.1. LIZING OLUVCHI o‘z hisob raqami orqali LIZING OBYEKTI narxining{' '}
						{metric ? Number(metric.min_deposit_percentage) : '__'} foizidan kam bo‘lmagan qismini
						avans shaklida ushbu shartnoma imzolangan kundan boshlab 15 (o‘n besh) bank kun ichida
						LIZING BERUVCHIga to‘lab beradi. LIZING OLUVCHI LIZING OBYEKTIni ro‘yxatdan o‘tkazish,
						yetkazib berish bilan bog‘liq xarajatlarni avans mablag‘iga qo‘shimcha tarzda LIZING
						BERUVCHIga to‘lab beradi. Bunda, LIZING OLUVCHIning avvalgi davrda tuzilgan (amaldagi)
						lizing shartnomasi bo‘yicha to‘lov muddati kelgan qarzdorligi mavjud bo‘lsa, to‘langan
						avans mablag‘lari birinchi navbatda amaldagi lizing shartnomasidan bo‘lgan qarzdorlikni
						qoplashga yo‘naltiriladi.
					</Text>
					<Text>
						4.2. Agarda LIZING OBYEKTIni texnik tavsifiga ko‘ra sug‘urtalash talab etilsa, LIZING
						OLUVCHI lizing shartnomasi bo‘yicha avans mablag‘larini to‘liq shakllantirgan kundan
						boshlab 10 (o‘n) kunlik muddatda LIZING OBYEKTIni o‘z hisobidan shartnomaning to‘liq
						muddatiga O‘zbekiston Respublikasi rezidenti hisoblangan sug‘urta tashkilotlaridan biri
						orqali sug‘urtalab, sug‘urta polisini LIZING BERUVCHIga taqdim etadi.
					</Text>
					<Text>
						4.3. Har choraklik lizing to‘lovlari LIZING OLUVCHI tomonidan LIZING OBYEKTI qabul qilib
						olingan kundan boshlab, ushbu shartnomaning ajralmas qismi bo‘lib hisoblangan
						1-ilovasida ko‘rsatilgan to‘lov jadval asosida differensial usulida hisoblanadi hamda
						lizing to‘lovlari mazkur jadval asosida LIZING OLUVCHI tomonidan har chorakning oxirgi
						oyining 10 (o‘ninchi) sanasigacha bo‘lgan muddatda to‘lab beriladi.
					</Text>
					<Text>
						4.4. Lizing to‘lovlari LIZING OLUVCHIning o‘z xohishiga ko‘ra shartnomada ko‘rsatilgan
						muddatlardan avval ham to‘lanishi mumkin. Lizing to‘lovlari muddatidan oldin qoplangan
						taqdirda, LIZING BERUVCHIning qolgan davrdagi daromad foizi chegirib tashlanadi va
						LIZING OBYEKTIga bo‘lgan mulk huquqi LIZING OLUVCHIga o‘tkaziladi. Bunda LIZING OLUVCHI
						tomonidan lizing to‘lovlari bir yildan kam muddatda qoplangan taqdirda, LIZING OLUVCHI
						dastlabki 12 (o‘n ikki) oylik lizing marjasini LIZING BERUVCHIga to‘liq to‘lab berish
						majburiyatini oladi.
					</Text>
				</View>

				<Text style={styles.title}>5. LIZING SHARTNOMASI BO‘YICHA TA’MINOT</Text>

				<View style={{ marginBottom: 12 }}>
					<Text>
						5.1. Lizing to‘lovlarining lizing shartnomasida belgilangan muddat va miqdorlarda
						qaytarilishini ta’minlash ta’minotning quyidagi turlaridan biri orqali amalga
						oshiriladi:
					</Text>
					<Text>
						- lizing to‘lovlarining to‘liq summasiga teng miqdordagi summaga to‘lov qobilyatiga ega
						bo‘lgan yuridik shaxs(lar)ning kafilligini tasdiqlovchi “Kafillik shartnomasi” orqali;
					</Text>
					<Text>
						- LIZING OBYEKTI narxining 120 (bir yuz yigirma) foizidan kam bo‘lmagan qiymatdagi
						yuqori likvidli mol-mulklar qo‘yilib notarial tartibda rasmiylashtirilgan garovga{' '}
						<Text style={{ fontWeight: 'bold' }}>“Garov shartnomasi”</Text> orqali;
					</Text>
					<Text>
						- lizing to‘lovlarini qaytarilmaslik xavfidan shartnomaning to‘liq muddatiga O‘zbekiston
						Respublikasi rezidenti hisoblangan yetakchi sug‘urta tashkilotlarida sug‘urtalash va
						qonunda nazarda tutilgan boshqa usullar orqali amalga oshirilishi mumkin.
					</Text>
				</View>

				<Text style={styles.title}>6. TOMONLARNING HUQUQ VA MAJBURIYATLARI</Text>

				<View style={styles.pageNumber} fixed>
					<Text style={styles.pageNumber}>2</Text>
				</View>
			</Page>

			{/* PAGE 3 */}
			<Page size='A4' style={styles.page}>
				<Text>
					6.1. Mazkur shartnomada boshqacha tartib belgilangan bo‘lmasa, tomonlarning huquq va
					majburiyatlari O‘zbekiston Respublikasining amaldagi qonun hujjatlari asosida tartibga
					solinadi.
				</Text>
				<Text style={{ fontWeight: 'bold' }}>6.2. LIZING OLUVCHI quyidagi huquqlarga ega:</Text>
				<Text>6.2.1. LIZING OBYEKTIni va SOTUVCHIni tanlash.</Text>
				<Text>
					6.2.2. LIZING BERUVCHIdan shartnoma shartlarini lozim darajada bajarilishini talab qilish.
				</Text>
				<Text>
					6.2.3. LIZING BERUVCHI va SOTUVCHI o‘rtasida tuzilgan oldi-sotdi shartnomasidan kelib
					chiquvchi talablarni, jumladan uning sifati, narxi, butligi, topshirish muddati, kafolatli
					ta'mirlash va hokazolar xususida SOTUVCHIga talablar qo‘yish.
				</Text>
				<Text>
					6.2.4. Lizing shartnomasi LIZING BERUVCHI tomonidan muddatidan oldin bekor qilingan
					taqdirda, lizing to‘lovlarini to‘lash jadvali (1-ilova)da belgilanganidan ortiqcha to‘lov
					o‘tkazilgan bo‘lsa, to‘langan ortiqcha to‘lovlarni qaytarib berishni talab etish.
				</Text>
				<Text>
					6.2.5. Lizing muddati mobaynida Lizing obyektidan foydalanish va unga egalik qilish.
				</Text>
				<Text>
					6.2.6. Ushbu shartnomaning 11.1-bandi shartlari to‘liq bajarilganidan so‘ng, lizing
					obyektini mulk sifatida o‘z nomiga rasmiylashtirib, qabul qilib olish.
				</Text>
				<Text style={{ fontWeight: 'bold' }}>6.3. LIZING OLUVCHIning majburiyatlari:</Text>
				<Text>
					6.3.1. Lizing obyektini qabul qilib olish, SOTUVCHIning manzilidan o‘z hisobidan olib
					ketish.
				</Text>
				<Text>
					6.3.2. Lizing obyektini ishga tushirish, soz holatda saqlash, texnik servis xizmat
					ko‘rsatish, ta'mirlash hamda lizing muddati davrida obyektiga yetkazilgan har qanday zarar
					bilan bog‘liq bo‘lgan barcha xarajatlarni o‘z hisobidan amalga oshirish.
				</Text>
				<Text>
					6.3.3. Lizing obyektini texnik tavsifiga qarab Qishloq xo‘jaligi vazirligi huzuridagi
					“Agrosanoat majmui ustidan nazorat qilish inspeksiyasi”ning tegishli bo‘limida o‘z nomiga
					davlat ro‘yxatidan o‘tkazish, har yilgi texnik ko‘rikdan o‘tkazish va texnik ko‘rik
					yig‘imlarini, shu bilan birga yo‘qotilgan davlat raqam belgisi va texnik pasport o‘rniga
					yangisini olish yig‘imlarini to‘lab berish.
				</Text>
				<Text>LIZING BERUVCHIning quyidagilar bo‘yicha qilgan xarajatlarini qoplab berish:</Text>
				<Text>
					- davlat raqam belgisi va texnik pasport olish, texnik guvohnoma olish dastlabki ko‘rik va
					davlat ro‘yxatidan o‘tganlik to‘lovi uchun yig‘imlarni to‘lash xarajatlarini;
				</Text>
				<Text>
					- texnikaga GPS (global pozitsiyalash tizimi) navigator qurilmasini o’rnatish
					harajatlarini va barcha abonent to’lovlarini;
				</Text>
				<Text>
					- lizing shartnomasi LIZING OLUVCHIning o‘z majburiyatlarini bajarmaganligi yoki
					taraflarning o‘zaro kelishuvi asosida bekor qilinganda hamda lizing OLUVCHIning tashabbusi
					bilan lizing obyekti “Huquq va majburiyatlarni o‘tkazish shartnomasi” asosida uchinchi
					shaxslarga o‘tkazilganda hisobdan chiqarish yig‘imini to‘lash xarajatlarini.
				</Text>
				<Text>
					6.3.4. Bankdagi o‘z hisob raqamlari, tashkiliy-huquqiy shakli va yuridik manzili
					o‘zgarganligi to‘g‘risida LIZING BERUVCHIni rasman xabardor qilish.
				</Text>
				<Text>
					6.3.5. Har chorakda bir marta LIZING BERUVCHIning manziliga kelgan holda o‘tgan davr uchun
					o‘zaro buxgalteriya solishtirish dalolatnomasini tuzish.
				</Text>
				<Text>
					6.3.6. Lizing obyektidan foydalanish imkoniyatining cheklanganligi, texnik nosozligi,
					ishlatishni iqtisodiy samarasizligi, ob-havoning noqulay kelishi yoki shunga o‘xshash
					turli holatlar yuzaga kelishidan qat'iy nazar lizing to‘lovlarini va ushbu shartnoma
					bo‘yicha LIZING BERUVCHI tomonidan qilingan xarajatlarni shartnomada belgilangan muddat va
					miqdorlarda to‘lab berish.
				</Text>
				<Text>
					6.3.7. Lizing obyektidan texnika xavfsizligi qoidalariga rioya qilgan holda, uning texnik
					pasportida ko‘rsatilgan vazifa va texnik imkoniyatlari darajasida texnik shartlarga
					muvofiq foydalanish hamda lizing obyektini haydovchilik guvohnomasi bo‘lmagan shaxslarga
					boshqarishga bermaslik, soz (yangi) detal va uzellarini nosoz (eskisi)ga almashtirmaslik.
				</Text>
				<Text>
					6.3.8. LIZING BERUVCHI va SOTUVCHIning yozma ruxsatisiz lizing obyekti konstruksiyasiga
					o‘zgartirishlar kiritmaslik va mazkur lizing obyekti uchun mo‘ljallanmagan uskuna yoki
					jihozlarni o‘rnatmaslik, texnikaga o’rnatilgan GPS (global pozitsiyalash tizimi) navigator
					qurilmasining doimiy ishlab turishini ta’minlash, lizing obyektining buzilishi,
					yo‘qolishi, o‘g‘irlanishi, yaroqsiz holga kelishi yoki shikastlanishi bilan bog‘liq barcha
					zararni bartaraf etish imkoniyati bor-yo‘qligidan qat'iy nazar, javobgarlikni o‘z
					zimmasiga oladi.
				</Text>
				<Text>
					6.3.9. Lizing obyektini lizing shartnomasi muddati davrida sotmaslik, garovga qo‘ymaslik,
					uchinchi shaxslarga bermaslik, qarovsiz qoldirmaslik va unga nisbatan boshqa noqonuniy
					harakatlarni amalga oshirmaslik.
				</Text>
				<Text>
					6.3.10. Yer ijara shartnomasi bekor qilinganda, LIZING OLUVCHI “Bankrot” deb e'lon
					qilinganida, tugatish jarayoni boshlanganda yoki qayta tashkil etilganida, bu haqda LIZING
					BERUVCHIni xabardor qilgan holda 15 (o‘n besh) kalendar kun muddatida quyidagi shartlardan
					birini bajarish lozim:
				</Text>
				<Text>
					- shartnoma bo‘yicha barcha lizing to‘lovlarini oldindan to‘lab berish orqali lizing
					obyektini o‘z mulki etib sotib olish;
				</Text>
				<Text>
					- shartnoma bo‘yicha huquq va majburiyatlarni uchinchi shaxs zimmasiga o‘tkazish;
				</Text>
				<Text>
					- lizing obyektini soz va but holatida LIZING BERUVCHIga o‘rnatilgan tartibda qaytarish,
					qarzdorlik va penyani hamda boshqa to‘lovlarni to‘lash.
				</Text>
				<Text>
					6.3.11. LIZING BERUVCHI vakillarini lizing OLUVCHIning lizing obyektidan qanday
					sharoitlarda foydalanayotganligini va uni belgilangan maqsadga muvofiq ishlatayotganligini
					monitoringdan o‘tkazishiga qarshilik qilmaslik.
				</Text>
				<Text>
					6.3.12. Lizing shartnomasi muddatidan oldin bir taraflama bekor qilinganida lizing
					obyektini soz va but holatda LIZING BERUVCHIga o‘rnatilgan tartibda rasmiylashtirilgan
					“Dalolatnoma” asosida 3 (uch) kunlik muddatda qaytarish.
				</Text>
				<Text>
					6.3.13. Quyidagi holatlarda LIZING BERUVCHIning yozma talabiga ko‘ra LIZING OLUVCHI ushbu
					shartnomaga “O‘zgartirish va qo‘shimchalar kiritish to‘g‘risida kelishuv”ni imzolash
					majburiyatini oladi:
				</Text>
				<Text>
					A) Lizing obyektining qiymati SOTUVCHIga to‘liq to‘lab berilishigacha bo‘lgan davrda
					SOTUVCHI tomonidan lizing obyekti narxi
				</Text>

				<View style={styles.pageNumber} fixed>
					<Text style={styles.pageNumber}>3</Text>
				</View>
			</Page>

			{/* PAGE 4 */}
			<Page size='A4' style={styles.page}>
				<Text>
					o‘zgartirilishi, respublikada Markaziy bankning asosiy bank stavkasi o‘zgarishi hamda
					LIZING BERUVCHIning Boshqaruv majlisi qarori asosida mazkur shartnomadagi lizing obyekti
					narxini, lizing foizi va lizing summasini o‘zgartirish zaruriyati yuzaga kelganida;
				</Text>
				<Text>
					B) SOTUVCHI tomonidan lizing obyektini yetkazib berish muddati kechiktirib yuborilishi
					natijasida, mazkur shartnomadagi yetkazib berish muddatini o‘zgartirish zaruriyati yuzaga
					kelganida;
				</Text>
				<Text>
					V) SOTUVCHI tomonidan mazkur rusumdagi lizing obyektini ishlab chiqarilishi
					to‘xtatilganligi natijasida, mazkur shartnomadagi lizing obyekti rusumini boshqa rusumga
					o‘zgartirish zaruriyati yuzaga kelganida yoki SOTUVCHI o‘zgarganda;
				</Text>
				<Text>
					G) Mazkur lizing obyektining avans to‘lovi bilan qoplanmagan qiymatini moliyalashtirish
					uchun LIZING BERUVCHI tomonidan jalb qilinayotgan kredit foizini Kredit beruvchi bank
					tomonidan LIZING BERUVCHI kutganidan yuqori foizda etib belgilanishi natijasida, mazkur
					shartnomadagi yillik lizing foizi miqdorini oshirish zaruriyati yuzaga kelganida;
				</Text>
				<Text>
					D) Lizing obyektini Lizing OLUVCHI joylashgan manzilga transportda yetkazib berish LIZING
					BERUVCHIning mablag‘i hisobidan amalga oshirilishi natijasida, mazkur xarajatni qoplab
					berish zaruriyati yuzaga kelganida;
				</Text>
				<Text>
					Y) Mazkur turdagi lizing obyektini lizingga rasmiylashtirish va moliyalashtirish yuzasidan
					O‘zbekiston Respublikasi Prezidenti yoki Vazirlar Mahkamasining qarorlari asosida
					imtiyozlar berilganida.
				</Text>
				<Text>
					E) O‘zbekiston Respublikasi, O‘zbekiston Respublikasi Qishloq xo‘jalik vazirligi va
					“O‘zagrolizing” AJ o‘rtasida tuzilgan “LIZING SUBSIDIAR QARZ BITIMI” shartlariga tegishli
					o‘zgartirish kiritilgan hollarda.
				</Text>
				<Text>
					6.3.14. LIZING OLUVCHIning O‘zbekiston Respublikasi, O‘zbekiston Respublikasi Qishloq
					xo‘jalik vazirligi va “O‘zagrolizing” AJ o‘rtasida tuzilgan “LIZING SUBSIDIAR QARZ BITIMI”
					talablaridan kelib chiquvchi majburiyatlari:
				</Text>
				<Text>
					(i) Agar Lizing shartnomasi doirasida Lizing OLUVCHI o‘z majburiyatlarini to‘liq yoki
					qisman bajarmasa Lizing obyektidan (Lizing Sub-qarz mablag‘laridan) foydalanish huquqini
					to‘xtatib turish yoki bekor qilish, lizing obyektini Lizing beruvchiga darhol qaytarish;
				</Text>
				<Text>
					(ii) Amaldagi bolalar va majburiy mehnat to‘g‘risidagi qonunlar va qoidalarga rioya
					qilmasligi aniqlanganda, Lizing obyektidan (Lizing Sub-qarz mablag‘laridan) foydalanish
					huquqini to‘xtatib turish yoki bekor qilish va Lizing obyekti qaytarilishini ta’minlash;
				</Text>
				<Text>
					(iii) Lizing obyektidan Xalqaro taraqqiyot uyushmasi va Xalqaro tiklanish va taraqqiyot
					banki (keyingi o‘rinlarda - XTU/XTTB) uchun maqbul belgilangan texnik, iqtisodiy,
					moliyaviy, ma’muriy, ekologik, sanitariya va ijtimoiy standartlar va tartibotlarga muvofiq
					tegishli ravishda va samaradorlik bilan foyfalanishni ta’minlash;
				</Text>
				<Text>
					(iv) Bolalar va majburiy mehnatga oid amaldagi qonun va qoidalar talablariga rioya qilish,
					Korrupsiyaga qarshi kurashish ko‘rsatmalariga amal qilish, Ekologik va ijtimoiy majburiyat
					rejasiga muvofiq harakat qilish;
				</Text>
				<Text>
					(v) XTU/XTTB uchun maqbul izchil qo‘llaniladigan va shu tarzda muvofiqlik mezonlariga
					javob beradigan lizing loyihasi bilan bog‘liq operatsiyalar, resurslar va xarajatlarni mos
					ravishda aks ettiradigan buxgalteriya hisobi standartlariga muvofiq moliya boshqaruvi
					yuritilishini va moliyaviy hisobot tayyorlanishini ta’minlash;
				</Text>
				<Text>
					(vi) XTU/XTTB uchun maqbul izchil qo‘llaniladigan audit standartlariga muvofiq mustaqil
					auditorlar jalb etilgan holda o‘z moliyaviy hisobotlari tekshiruvi o‘tkazilishini hamda
					Lizing beruvchiga auditorlik hisobotlarining operativ taqdim etilishini ta’minlash;
				</Text>
				<Text>
					(vii) “LIZING SUBSIDIAR QARZ BITIMI”ga muvofiq mazkur shartnoma bo‘yicha o‘z
					majburiyatlari lozim darajada bajarilishini, shu jumladan asosiy qarz o‘z vaqtida va
					to‘liq qaytarilishini hamda hisoblangan foizlar belgilangan muddatlarda to‘lanishini
					ta’minlash.
				</Text>
				<Text>
					6.3.15. LIZING OLUVCHI qonun hujjatlari va shartnomada belgilangan boshqa majburiyatlarni
					bajaradi.
				</Text>
				<Text style={{ fontWeight: 'bold', marginTop: 4, marginBottom: 4 }}>
					6.4. LIZING BERUVChI quyidagi huquqlarga ega:
				</Text>
				<Text>
					6.4.1. Agar LIZING OLUVCHI tomonidan lizing to‘lovlari to‘lanishi ushbu shartnomaning
					1-ilovasida belgilangan miqdor va muddatlarda ko‘rsatilganidan kechiktirilsa, to‘lanmasa
					yoki to‘liq to‘lanmasa, shuningdek texnikaga o’rnatilgan GPS (global pozitsiyalash tizimi)
					navigator qurilmasining doimiy ishlab turishini ta’minlamasa yoki unga shikast yetkazsa,
					“Lizing obyektidan foydalanishni vaqtinchalik taqiqlash dalolatnomasi”ni tuzib, lizing
					obyektidan foydalanishni qarzlar to‘languniga qadar yoki GPS (global pozitsiyalash tizimi)
					navigator qurilmasi soz holatga keltirilguniga qadar bo‘lgan muddatga (lizing obyekti
					kabinasi va boshqaruv jihozlarini plombalash orqali) taqiqlash yoki saqlab turish uchun
					vaqtincha LIZING OLUVCHIning hududidan olib chiqib ketish;
				</Text>
				<Text>
					LIZING OLUVCHI va shartnomaning 5.1-bandi asosida taqdim etilgan ta'minot hisobidan lizing
					to‘lovlari bo‘yicha hosil bo‘lgan qarzlarni, penyani, zararni hamda boshqa to‘lovlarini
					undirish.
				</Text>
				<Text>
					6.4.2. Lizing obyekti yo‘qotilsa, foydalanishga yaroqsiz holatga keltirilsa yoki
					talon-toroj qilinsa, LIZING OLUVCHIning lizing to‘lovlaridan hosil bo‘lgan qarzdorligini,
					lizing obyektining qoldiq summasi bilan birgalikda, penya, zarar hamda boshqa to‘lovlarni
					muddatidan oldin to‘lashni talab etish.
				</Text>
				<Text>
					6.4.3. LIZING OLUVCHI ushbu shartnomaning 3.3, 3.4, 4.1- va 4.2-bandlarida kelishilgan
					shartlarni belgilangan muddatlarda bajarmasa, shartnomaning 5.1-bandi asosida ta'minotning
					bir turini taqdim etmasa yoki 6.3.13- va 6.3.14-bandlarida bayon etilgan holat bo‘yicha
					olingan majburiyatni bajarishdan bosh tortsa, u holda shartnomani muddatidan oldin bir
					taraflama bekor qilish.
				</Text>
				<Text>
					6.4.4. LIZING OLUVCHI tomonidan lizing obyektidan qanday sharoitlarda va belgilangan
					maqsadlarga muvofiq ishlatayotganligi hamda o‘z vaqtida texnik xizmatlar
					ko‘rsatilayotganligini lizing muddatining istalgan davrida nazorat qilish.
				</Text>
				<Text>
					6.4.5. LIZING OLUVCHI lizing shartnomasi shartlarini jiddiy tarzda buzgan taqdirda, lizing
					OLUVCHIdan qabul qilingan to‘lov summasi barcha lizing to‘lovlarining uchdan ikki qismidan
					oshgan taqdirda ham, bir vaqtning o‘zida bir taraflama lizing shartnomasini bekor qilish,
					LIZING OLUVCHIdan lizing obyektini soz va but holatda qaytarib olish, shartnoma bekor
					qilingan kunga qadar hosil bo‘lgan lizing to‘lovlaridan qarzdorlik, penya, zarar
					summalarini va boshqa to‘lovlarni lizing OLUVCHI tomonidan to‘lab berilgan avans hisobidan
					ushlab qolish va undirish.
				</Text>

				<View style={styles.pageNumber} fixed>
					<Text style={styles.pageNumber}>4</Text>
				</View>
			</Page>

			{/* PAGE 5 */}
			<Page size='A4' style={styles.page}>
				<View style={{ marginBottom: 12 }}>
					<Text>
						6.4.6. LIZING BERUVChI, LIZING OLUVCHIni yozma ravishda rasmiy ogohlantirgan holda unga
						o‘z majburiyatini bajarishi uchun 15 (o‘n besh) kunlik muddat berganidan keyin ham
						majburiyat bajarilmagan va lozim darajada bajarilmagan taqdirda, lizing shartnomasini
						muddatidan oldin bir taraflama bekor qilib, LIZING OLUVCHIdan lizing obyektini soz va
						but holatda qaytarib olish.
					</Text>
					<Text>
						6.4.7. LIZING BERUVCHI lizing to‘lovlaridan hosil bo‘lgan qarzdorlikni undirish uchun
						LIZING OLUVCHIning hisob-raqamlariga akseptsiz inkasso topshiriqnomasi qo‘yish.
					</Text>
					<Text>
						6.4.8. LIZING BERUVCHI qonun hujjatlarida belgilangan boshqa huquqlarga ham ega bo‘lishi
						mumkin.
					</Text>
					<Text style={{ fontWeight: 'bold' }}>6.5. LIZING BERUVChIning majburiyatlari:</Text>
					<Text>
						6.5.1 Lizing obyektini sotib olish va LIZING OLUVCHIga ushbu shartnomada belgilangan
						muddatlarda topshirish.
					</Text>
					<Text>
						6.5.2. Lizing OBYEKTIni lizingga berilishi to‘g‘risida SOTUVCHIga ma'lum qilish.
					</Text>
					<Text>
						6.5.3. Lizing obyektining sifati va butligi, topshirish muddati, kafolatli ta'mirlash va
						hokazolar xususida SOTUVCHIga talablar qo‘yishda LIZING OLUVCHIga yordam berish.
					</Text>
				</View>

				<Text style={styles.title}>7. SHARTNOMANING BOSHQA SHARTLARI</Text>

				<View style={{ marginBottom: 12 }}>
					<Text>
						7.1. Lizing obyektini SOTUVCHI tomonidan kafolatli ta'mirlash muddati uni lizingga
						rasmiylashtirilgan kundan boshlab 12 oyni tashkil etadi. Kafolatli ta'mirlash shartlari
						va tartibi quyidagicha:
					</Text>
					<Text>
						LIZING OLUVCHI dastlab SOTUVCHIga yoki SOTUVCHI tomonidan belgilangan servis xizmati
						ko‘rsatuvchiga lizing obyektining buzilganligi to‘g‘risida darhol yozma xabar berishi
						lozim.
					</Text>
					<Text>
						SOTUVCHI yoki lizing obyektiga servis xizmati ko‘rsatuvchi, shunday xabarni olganidan
						so‘ng 5 kun muddat ichidao‘z vakilini lizing obyektini ko‘rikdan o‘tkazish va buzilish
						sababini aniqlash uchun LIZING OLUVCHIning manziliga yuboradi.
					</Text>
					<Text>
						SOTUVCHI yoki lizing obyektiga xizmat ko‘rsatuvchi vakili, LIZING OLUVCHI vakili va
						“Agrosanoat majmui ustidan nazorat qilish inspeksiyasi”ning tegishli shahar yoki tuman
						inspeksiyasi vakili ishtirokida rasmiy ko‘rinishdagi “Buzilish sabablari to‘g‘risidagi
						Dalolatnoma” tuziladi va belgilangan shakldagi “Kafolatli ta'mirlashga talabnoma”
						blankasi to‘ldiriladi.
					</Text>
					<Text>
						LIZING OLUVCHI tomonidan lizing obyektining ishdan chiqqan qismi SOTUVCHIning vakiliga
						topshiriladi.
					</Text>
					<Text>
						SOTUVCHIning kafolati uning xohishiga qarab, lizing obyektining ishdan chiqqan qismini
						almashtirish yoki ta'mirlab berish bilan chegaralanadi.
					</Text>
					<Text>
						LIZING OLUVCHI “Lizing obyektini ishlatish va saqlash qoidalari to‘g‘risida qo‘llanma”
						talablariga rioya etgan holda Lizing OBYEKTIdan foydalanganida va bunday buzilish
						SOTUVCHIning aybi bilan sodir bo‘lganida lizing OBYEKTI SOTUVCHI tomonidan kafolatli
						ta'mirlanadi.
					</Text>
					<Text>
						7.2. Kafolatli ta'mirlash muddati ichida lizing obyektining maxsus plombalangan uzel va
						agregatlari faqat SOTUVCHI tomonidan belgilangan ustaxona yoki uning ko‘chma ustaxonasi
						tomonidan tuzatilishi mumkin.
					</Text>
					<Text>
						7.3. LIZING OLUVCHIning aybi bilan ishdan chiqqan lizing obyekti uning o‘z mablag‘i
						hisobidan tuzatiladi. Kafolatli ta'mirlash muddati tugaganidan keyingi davrda lizing
						obyektiga servis xizmatini ko‘rsatish LIZING OLUVCHI bilan lizing obyektiga servis
						ko‘rsatuvchi shaxs o‘rtasida tuzilgan alohida shartnoma asosida amalga oshiriladi.
					</Text>
				</View>

				<Text style={styles.title}>8. TOMONLARNING JAVOBGARLIGI</Text>

				<Text>
					8.1. Tomonlarning javobgarligi, mazkur shartnomada boshqacha tartib nazarda tutilgan
					bo‘lmasa, O‘zbekiston Respublikasining amaldagi qonun hujjatlariga asosan belgilanadi.
				</Text>
				<Text>
					8.2. LIZING OLUVCHI tomonidan ushbu shartnomada belgilangan muddatda yetkazib berilgan
					(yoki yetkazib berilishi kutilayotgan) lizing obyektini olish asossiz ravishda rad
					etilganligi yoki lizing shartnomasi uning aybi bilan lizing obyekti yetkazib berilganiga
					qadar bekor qilingan taqdirda, u LIZING BERUVChIga lizing obyekti qiymatining 1 (bir)
					foizi miqdorida jarima to‘laydi.
				</Text>
				<Text>
					Jarima summasi LIZING OLUVCHIning lizing obyekti uchun to‘lagan avans mablag‘laridan
					ushlab qolinadi.
				</Text>
				<Text>
					8.3. Lizing to‘lovi ushbu shartnomaning 1-ilovasida ko‘rsatilgan miqdor va muddatlarda
					amalga oshirilmasa, LIZING OLUVCHI to‘lov muddati o‘tkazib yuborilgan har bir kun uchun
					kechiktirilgan to‘lov summasining 0,4 foizi miqdorida, ammo kechiktirilgan umumiy to‘lov
					summasining 50 foizidan ortiq bo‘lmagan miqdorda penya to‘laydi.
				</Text>
				<Text>
					8.4. Agar LIZING BERUVChI tomonidan uning aybi bilan ushbu shartnomaning 2.1.-bandida
					kelishilgan muddat ichida lizing obyekti yetkazib berilmasa, u holda LIZING BERUVChI
					LIZING OLUVCHIga kechiktirilgan har bir kun uchun majburiyat bajarilmagan qismining 0,1
					foizi miqdorida penya to‘laydi, biroq bunda penya summasi yetkazib berilmagan lizing
					obyekti narxining 5 foizidan oshib ketmasligi lozim.
				</Text>
				<Text>
					8.5. LIZING BERUVChI lizing obyektini o‘z vaqtida lizingga rasmiylashtirib bermaganligi
					uchun quyidagi holatlarda LIZING OLUVCHI oldida har qanday javobgarlikdan va ushbu
					shartnomaning
				</Text>
				<Text>8.4-bandida belgilangan penyani to‘lashdan ozod etiladi:</Text>
				<Text>
					- LIZING OLUVCHI shartnomada belgilangan muddatlarda avans summasini to‘liq to‘lamagan
					yoki shartnomaning 5.1-bandi asosida ta'minotning bir turini taqdim etmagan bo‘lsa;
				</Text>
				<Text>
					- LIZING OBYEKTI SOTUVCHI tomonidan oldi-sotdi shartnomasida belgilangan muddatda ishlab
					chiqarilmagan va LIZING BERUVChIga yetkazib berilmagan bo‘lsa;
				</Text>

				<View style={styles.pageNumber} fixed>
					<Text style={styles.pageNumber}>5</Text>
				</View>
			</Page>

			{/* PAGE 6 */}
			<Page size='A4' style={styles.page}>
				<View style={{ marginBottom: 12 }}>
					<Text>
						- Ushbu shartnomaning 6.3.13-bandida qayd etilgan holatlar bo‘yicha shartnomaga
						belgilangan tartibda “O‘zgartirish va qo‘shimchalar kiritish to‘g‘risida kelishuv”ni
						LIZING OLUVCHI imzolashdan bosh tortgan taqdirda.
					</Text>
					<Text>
						8.6. LIZING BERUVChI, LIZING OLUVCHIning oldida lizing obyektining sifati, butligi,
						kafolatli ta'mirlash davrida buzilgan taqdirda o‘z vaqtida tuzatib berish, buzilib
						ishdan chiqishi, texnik servis xizmat ko‘rsatish, ta'mirlanishi va boshqalar yuzasidan
						javobgar bo‘lmaydi.
					</Text>
					<Text>
						8.7. Lizingga olingan lizing obyektining buzilib, ta'mirlanmasdan tashlab qo‘yilsa,
						yo‘qotilsa va talon-taroj etilsa aybdor bo‘lgan LIZING OLUVCHI O‘zbekiston Respublikasi
						amaldagi qonunchiligida va ushbu shartnomada belgilangan tartibda javobgarlikka
						tortiladi.
					</Text>
					<Text>
						8.8. LIZING OLUVCHI tomonidan ushbu shartnomaning 6.3-bo‘limidagi majburiyatlar
						bajarilmaganligi yoki lozim darajada bajarilmaganligi natijasida LIZING BERUVChI undan
						lizing obyektini nosoz (ya'ni, shikastlangan, tarkibiy qismlari va ichki detallari
						ishdan chiqqan, buzilgan, yo‘qotilgan) holda qaytarib olsa, u holda LIZING OLUVCHI
						LIZING BERUVChI mulkiga yetkazilgan zarar summasini to‘laydi va qonunchilikda
						belgilangan tartibda javobgar bo‘ladi. Zarar summasiga LIZING BERUVChIning lizing
						obyektini qaytarish, transportda tashish, saqlash, ta'mirlash bilan bog‘liq va boshqa
						xarajatlar ham kiradi.
					</Text>
				</View>

				<Text style={styles.title}>9. FORS-MAJOR HOLATLARI</Text>

				<View style={{ marginBottom: 12 }}>
					<Text>
						9.1. Tomonlar o‘zlarining xohish-irodasiga bog‘liq bo‘lmagan, yengib bo‘lmas kuch
						ta'sirida yuzaga kelgan hodisalar tufayli, shuningdek tabiiy ofatlar, harbiy hapakatlar,
						tomonlar uchun majburiy kuchga ega bo‘lgan Hukumat va boshqa organlarning hujjatlari
						chiqarilgan holatlar natijasida shartnoma majburiyatlarini bajarmagan yoki tegishli
						tarzda bajara olmagan bo‘lsalar, fors-major holati tugagunigacha bo‘lgan muddatlarga uni
						bajarishdan qisman yoki to‘liq ozod etiladilar.
					</Text>
				</View>

				<Text style={styles.title}>10. NIZOLARNI HAL ETISh</Text>

				<View style={{ marginBottom: 12 }}>
					<Text>
						10.1. Tomonlar shartnomaviy munosabatlardan kelib chiqadigan nizolarni imkoniyat
						darajasida o‘zaro kelishuvga asosan hal qilish choralarini ko‘radilar.
					</Text>
					<Text>
						10.2. Tomonlar o‘rtasida o‘z yechimini topmagan nizolar sudda ko‘rib chiqiladi. Bunda,
						shartnoma majburiyatlarini bajarmaslik natijasida “Javobgar” bo‘lgan tomon zimmasiga Sud
						(davlat boji, pochta) xarajatlarini to‘lash majburiyati yuklanadi.
					</Text>
				</View>

				<Text style={styles.title}>11. ShARTNOMANING AMAL QILISh MUDDATI</Text>

				<View style={{ marginBottom: 12 }}>
					<Text>
						11.1. Shartnoma, uni ikki tomon imzolagan kundan boshlab kuchga kiradi va ushbu
						shartnomaning 1-ilovasida ko‘rsatilgan lizing to‘lovlari va kechiktirilgan lizing
						to‘lovlari summasiga to‘lov kechikkan davr uchun hisoblangan penya va shartnomada
						belgilangan boshqa to‘lovlar, lizing obyektiga yetkazilgan zarar summasi LIZING
						BERUVChIning hisob raqamiga to‘liq to‘lab berilgan sanagacha va tomonlarning o‘z
						zimmasiga olgan majburiyatlari bajarilgunga qadar amalda bo‘ladi.
					</Text>
					<Text>
						11.2. Shartnoma muddatidan oldin bekor qilinganida, shartnoma amalda bo‘lgan davrda
						to‘langan lizing to‘lovlari va sudning qarori asosida undirilgan to‘lovlar (penya va sud
						xarajatlari) LIZING OLUVCHIGA qaytarilmaydi. (Grafikda belgilanganidan ortiqcha
						to‘langan lizing to‘lovlari bundan mustasno)
					</Text>
				</View>

				<Text style={styles.title}>
					12. ShARTNOMANI O‘ZGARTIRISh, BEKOR QILISh va LIZING OBYEKTINI QAYTARIB OLISh TARTIBI
				</Text>

				<View style={{ marginBottom: 12 }}>
					<Text>
						12.1. Ushbu shartnomaga o‘zgartirish va qo‘shimchalar kiritish, bekor qilish
						“tomonlar”ning o‘rnatilgan tartibda rasmiylashtirilgan “Kelishuv”i asosida amalga
						oshiriladi, ushbu shartnomaning 12.2-bandi shartlari bundan mustasno.
					</Text>
					<Text>
						12.2. LIZING BERUVChI tomonidan LIZING OLUVCHIga yozma ravishda rasmiy ogohlantirish
						xati (talabnoma) bilan o‘z majburiyatini bajarishi uchun 15 (o‘n besh) kunlik muddat
						berilganidan keyin ham majburiyat bajarilmagan yoki lozim darajada bajarilmagan
						taqdirda, LIZING BERUVChI quyidagi holatlarda ushbu shartnomani muddatidan oldin bir
						taraflama bekor qilish huquqiga ega: LIZING OLUVCHI tomonidan lizing to‘lovlari ushbu
						shartnomaning ajralmas qismi bo‘lib hisoblangan 1-ilovasida ko‘rsatilgan to‘lov grafigi
						asosida ketma-ket ikki marta va undan ortiq muddat mobaynida to‘lanmagan va to‘liq
						to‘lanmagan taqdirda; LIZING OLUVCHI ushbu shartnomaning 4.1-bandida kelishilgan
						muddatlarda avans to‘lovini to‘liq to‘lamasa va shartnomaning 5.1-bandi asosida
						ta'minotning bir turini LIZING BERUVChIga taqdim etmaganda; ushbu shartnomaning
						6.3.13-bandida bayon etilgan holatlar bo‘yicha LIZING OLUVCHI mazkur shartnomaga
						o‘zgartirish va qo‘shimchalar kiritish masalasida kelishishdan bosh tortsa; ushbu
						shartnomaning 6.3.14-bandida bayon etilgan talablardan kamida bittasini bajarmasa;
						LIZING OLUVCHI mazkur shartnomaning 13.2-bandiga muvofiq shartnoma shartlarini jiddiy
						buzilishiga yo‘l qo‘ygan taqdirda; Lizing obyektiga o’rnatilgan GPS (global
						pozitsiyalash tizimi) navigator qurilmasiga har qanday ko‘rinishda shikast yetkazilsa.
						Bunda, mazkur qurilmaga birinchi marta shikast yetkazilganlik holati uchun bazaviy
						hisoblash miqdorining 10 baravari miqdorida jarima undiriladi. Jarima qo‘llanilgandan
						so‘ng aniqlangan shikast yetkazilganlik holati shartnomani muddatidan oldin bir
						taraflama bekor qilish uchun asos bo‘ladi. Agarda LIZING OLUVCHI mazkur shartnoma bir
						tomonlama bekor qilingandan so‘ng, lizing obyektini ixtiyoriy ravishda topshirmasa,
						LIZING BERUVChI lizing obyektini soz va but holatda qaytarish majburiyatini LIZING
						OLUVCHIga yuklash to‘g‘risida va boshqa da'vo talablari bilan sudga murojaat qilish
						huquqiga ega.
					</Text>
				</View>

				<Text style={styles.title}>13. YAKUNLOVChI QOIDALAR</Text>
				<Text>
					13.1. Lizing to‘lovlari LIZING OLUVCHI tomonidan shartnomada belgilangan grafik bo‘yicha
					ketma-ket ikki marta va undan ortiq
				</Text>

				<View style={styles.pageNumber} fixed>
					<Text style={styles.pageNumber}>6</Text>
				</View>
			</Page>

			{/* PAGE 7 */}
			<Page size='A4' style={styles.page}>
				<Text>
					muddat mobaynida to‘lanmasa, lizing obyekti LIZING OLUVCHI hisobidan joriy ta'mirlanmasa,
					undan foydalanish va saqlash bo‘yicha ushbu shartnomaning 6.3 va 7.2-bandlari shartlari
					buzilgan bo‘lsa, bu holatlardan istalgan biri shartnoma shartlarini jiddiy buzish
					hisoblanadi.
				</Text>
				<Text>
					13.2. Lizing muddati mobaynida LIZING OLUVCHI tomonidan LIZING BERUVChIning rasmiy
					roziligisiz lizing obyekti holatini yaxshilash uchun unga o‘rnatilgan har qanday
					uzel-detallari yoki boshqa tarkibiy qismlari LIZING BERUVChIning mulki deb hisoblanadi
					hamda lizing shartnomasi muddatidan oldin bekor qilinib lizing obyekti qaytarib olinganda
					ular LIZING OLUVCHIga qaytarilmaydi va qiymati to‘lanmaydi.
				</Text>
				<Text>
					13.3. Mazkur shartnoma bir xil yuridik kuchga ega bo‘lgan uch nusxada tuzilib, birinchi
					nusxasi - LIZING BERUVChIga, ikkinchi nusxasi - LIZING OLUVCHIga, uchinchi nusxasi –
					mas'ul hodimga (filial ekspeditri) beriladi.
				</Text>

				<Text
					style={{
						fontWeight: 'bold',
						textAlign: 'center',
						textTransform: 'uppercase',
						marginTop: 8,
						marginBottom: 16
					}}
				>
					TOMONLARNING YURIDIK MANZILLARI VA REKVIZITLARI
				</Text>

				<View
					style={{
						flexDirection: 'row',
						justifyContent: 'space-around',
						marginBottom: 24
					}}
				>
					<View style={{ width: '36%' }}>
						<Text style={{ fontWeight: 'bold', textAlign: 'center' }}>LIZING BERUVCHI</Text>
						<Text style={{ fontWeight: 'bold', textAlign: 'center' }}>
							“O‘zagrolizing” AJ Andijon viloyat filiali Andijon sh.A.Fitrat ko’chasi 214-uy. ATB
							“AGROBANK” Toshkent shahar Bosh amaliyotlar boshqarmasi
						</Text>
						<Text>Asosiy h/r 2021 0000 9040 2125 1001</Text>
						<Text>Transh h/r - 2321 0000 2040 2125 1333</Text>
						<Text>Transh h/r – 2322 0000 9040 2125 1333</Text>
						<Text>MFO-00394, STIR 203 071 206, OKED 64910</Text>
						<Text style={{ fontWeight: 'bold' }}>Filial direktori SH.Muxammadjanov</Text>
						<Text style={{ marginTop: 16 }}>Imzo _______________________</Text>
						<Text>m. o’.</Text>
					</View>

					<View style={{ width: '36%' }}>
						<Text style={{ fontWeight: 'bold', marginLeft: 16 }}>LIZING OLUVCHI</Text>
						<Text style={{ fontWeight: 'bold' }}>
							{customer ? customer.data.Наименование : '___________________________________'}
						</Text>
						<Text>Manzil: {customer ? customer.data.Адрес : '_________________________'}</Text>
						<Text>
							{customer ? customer.data.БанкНаименование : '___________________________________'}
						</Text>
						<Text>
							h/r: {customer ? customer.data.ОсновнойРасчетныйСчет : '_____________________'}
						</Text>
						<View>
							<Text style={{ marginRight: 4 }}>
								MFO: {customer ? customer.data.БанкМФО : '_____'}
							</Text>
							<Text style={{ marginLeft: 4 }}>
								STIR: {customer ? customer.data.ИНН : '___________'}
							</Text>
						</View>
						<Text>OKED: {customer ? customer.data.КодОКЕД : '_____'}</Text>
						<Text style={{ fontWeight: 'bold', marginTop: 16 }}>
							MCHJ rahbari:{' '}
							{values.client_director ? values.client_director : '_______________________'}
						</Text>
						<Text style={{ marginTop: 16 }}>Imzo _______________________</Text>
						<Text>m. o’.</Text>
					</View>
				</View>

				<Text style={{ fontWeight: 'bold', textAlign: 'center', marginBottom: 16 }}>
					Lizing shartnomasi loyihasiga yuridik XULOSA
				</Text>

				<Text>
					Ushbu lizing shartnomasi loyihasi O‘zbekiston Respublikasi “Xo‘jalik yurituvchi sub'ektlar
					faoliyatining shartnomaviy - huquqiy bazasi to‘g‘risida”gi Qonunining 10-moddasida nazarda
					tutilgan talablarga to‘liq javob beradi.
				</Text>
				<Text>
					Shartnomada taraflar shartnomaviy munosabatlarining O‘zbekiston Respublikasi Fuqarolik
					kodeksining 587-599 moddalari, O‘zbekiston Respublikasining “Lizing to‘g‘risida”gi va
					“Xo‘jalik yurituvchi sub'ektlar faoliyatining shartnomaviy-huquqiy bazasi to‘g‘risida”gi
					Qonunlarining amaldagi me'yorlari bilan tartibga solinishi nazarda tutilgan. Taraflarining
					javobgarligi va nizolarni hal etish tartiblari shartnomada ko‘rsatilgan va u amaldagi
					qonunchilik talablariga javob beradi.
				</Text>

				<View
					style={{
						flexDirection: 'row',
						flexWrap: 'nowrap',
						alignItems: 'center',
						justifyContent: 'space-around',
						marginTop: 32
					}}
				>
					<Text style={{ fontWeight: 'bold' }}>Filial bosh yuriskonsulti</Text>
					<Text style={{ fontWeight: 'bold' }}>____________________</Text>
					<Text style={{ fontWeight: 'bold' }}>B. Teshaboev</Text>
				</View>

				<View style={styles.pageNumber} fixed>
					<Text style={styles.pageNumber}>7</Text>
				</View>
			</Page>

			{/* PAGE 8 */}
			<Page size='A4' style={styles.page}>
				<View style={{ maxWidth: 160, marginLeft: 'auto', marginBottom: 32 }}>
					<Text style={{ textAlign: 'center' }}>
						2025-yil 08-aprelda tuzilgan 24/02-4-428-sonli lizing shartnomasiga 2-ILOVA
					</Text>
				</View>

				<Text style={{ fontWeight: 'bold', textAlign: 'center', marginBottom: 32 }}>
					LIZING OBYEKTI va unga texnik xizmat ko‘rsatish <br /> uchun asbob-uskunalar to‘plami
				</Text>

				<Text
					style={{
						paddingLeft: 60,
						paddingRight: 60,
						marginBottom: 8
					}}
				>
					1){' '}
					<Text style={{ fontWeight: 'bold' }}>
						“{tech ? tech.model_name_uz : '_________________'}”
					</Text>{' '}
					rusumli LIZING OBYEKTI - 1 dona;
				</Text>
				<Text style={{ paddingLeft: 60, paddingRight: 60, marginBottom: 8 }}>
					2) LIZING OBYEKTIdan foydalanish bo‘yicha qo‘llanma;
				</Text>
				<Text style={{ paddingLeft: 60, paddingRight: 60, marginBottom: 8 }}>
					3) Servis kitobchasi;
				</Text>
				<Text style={{ paddingLeft: 60, paddingRight: 60, marginBottom: 8 }}>
					4) LIZING OBYEKTI uchun asbob-uskunalar to‘plami.
				</Text>

				<View
					style={{
						flexDirection: 'row',
						flexWrap: 'nowrap',
						alignItems: 'center',
						justifyContent: 'space-between',
						marginTop: 32
					}}
				>
					<Text style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>LIZING BERUVCHI</Text>
					<Text style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>LIZING OLUVCHI</Text>
				</View>

				<View
					style={{
						flexDirection: 'row',
						flexWrap: 'nowrap',
						alignItems: 'center',
						justifyContent: 'space-between',
						marginTop: 24
					}}
				>
					<Text style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>________________</Text>
					<Text style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>________________</Text>
				</View>

				<View style={styles.pageNumber} fixed>
					<Text style={styles.pageNumber}>8</Text>
				</View>
			</Page>

			{/* PAGE 9 */}
			{tableData && totals && (
				<Page size='A4' style={styles.page}>
					<View style={styles.table}>
						<View style={styles.row}>
							<Text style={[styles.cell, styles.headerCell, styles.col1]}>№</Text>
							<Text style={[styles.cell, styles.headerCell, styles.col2]}>Остаток займа</Text>
							<Text style={[styles.cell, styles.headerCell, styles.col3]}>Дата платежа</Text>
							<Text style={[styles.cell, styles.headerCell, styles.col4]}>Дней</Text>
							<Text style={[styles.cell, styles.headerCell, styles.col5]}>Основной долг</Text>
							<Text style={[styles.cell, styles.headerCell, styles.col6]}>Процент</Text>
							<Text style={[styles.cell, styles.headerCell, styles.col7, styles.lastCell]}>
								Общая сумма
							</Text>
						</View>

						{tableData.map((item, i) => (
							<View key={i} style={styles.row}>
								<Text style={[styles.cell, styles.col1]}>{i + 1}</Text>
								<Text style={[styles.cell, styles.col2]}>{formatPrice(item.balance, 2)}</Text>
								<Text style={[styles.cell, styles.col3]}>
									{formatDate(item.date, 'DD MMM YYYY', 'ru')}
								</Text>
								<Text style={[styles.cell, styles.col4]}>{item.days}</Text>
								<Text style={[styles.cell, styles.col5]}>{formatPrice(item.principal, 2)}</Text>
								<Text style={[styles.cell, styles.col6]}>{formatPrice(item.interest, 2)}</Text>
								<Text style={[styles.cell, styles.col7, styles.lastCell]}>
									{formatPrice(item.total, 2)}
								</Text>
							</View>
						))}

						<View style={styles.row}>
							<Text style={[styles.cell, styles.footerCell, { width: '52%' }]}>Общая сумма</Text>
							<Text style={[styles.cell, styles.footerCell, styles.col5]}>
								{formatPrice(totals.totalPrincipal, 2)}
							</Text>
							<Text style={[styles.cell, styles.footerCell, styles.col6]}>
								{formatPrice(totals.totalInterest, 2)}
							</Text>
							<Text style={[styles.cell, styles.footerCell, styles.col7, styles.lastCell]}>
								{formatPrice(totals.totalAmount, 2)}
							</Text>
						</View>
					</View>
				</Page>
			)}
		</Document>
	)
}

export default ContractDocument
