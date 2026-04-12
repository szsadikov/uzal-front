import { useMemo } from 'react'
import { AdaptableCard } from '@/components/shared'
import type { FormikValues } from './PaperTrackersAdd'

type Extras = {
	exp_insurance_number?: string
	exp_insurance_date?: string | Date | null
	attachments?: { id: string; name: string; size?: number }[]
}

/** Tab tiplari — shu fayldan export qilamiz, parent import qiladi */
export type TabKey =
	| 'expeditor'
	| 'financier'
	| 'accountant'
	| 'lawyer'
	| 'marketing'
	| 'monitoring'
	| 'zamdep'

// const TABS: { key: TabKey; label: string }[] = [
// 	{ key: 'expeditor', label: 'Экспедитор' },
// 	{ key: 'financier', label: 'Финансист' },
// 	{ key: 'accountant', label: 'Бухгалтер' },
// 	{ key: 'lawyer', label: 'Юрист' },
// 	{ key: 'marketing', label: 'Маркетинг' },
//
// 	{ key: 'monitoring', label: 'Мониторинг' },
// 	{ key: 'zamdep', label: 'Зампред' }
// ]

// function TabBar({ active, onChange }: { active: TabKey; onChange: (k: TabKey) => void }) {
// 	return (
// 		<div className='mb-6 border-b border-gray-300'>
// 			<div className='flex gap-6'>
// 				{TABS.map((t) => (
// 					<button
// 						key={t.key}
// 						type='button'
// 						onClick={() => onChange(t.key)}
// 						className={`relative pb-2 text-sm font-medium whitespace-nowrap ${
// 							active === t.key ? 'text-blue-600' : 'text-gray-700 hover:text-gray-900'
// 						}`}
// 					>
// 						{t.label}
// 						{active === t.key && (
// 							<span className='absolute -bottom-[1px] left-0 h-0.5 w-full bg-blue-600' />
// 						)}
// 					</button>
// 				))}
// 			</div>
// 		</div>
// 	)
// }

type Props = {
	values: Partial<FormikValues> & Partial<Extras>
	/** parentdan keladi */
	activeTab: TabKey
	/** bosilganda parentga xabar */
	onActiveChange: (k: TabKey) => void
}

// ---- helpers ----
const dash = (v: unknown) => (v === 0 || (!!v && String(v).trim()) ? String(v) : '—')
const fmtDate = (v: unknown) => {
	if (!v) return '—'
	if (typeof v === 'string') return v
	try {
		const d = new Date(v as Date)
		if (Number.isNaN(d.getTime())) return '—'

		return d.toISOString().slice(0, 10) // YYYY-MM-DD
	} catch {
		return '—'
	}
}
const kb = (b?: number) => (typeof b === 'number' ? `${Math.round(b / 1024)} кб` : '')

const PaperTrackersPreview = ({ values }: Props) => {
	// ---- Dynamic fields (real-time) ----
	const contractNum = dash((values as any).code)
	const contractDate = fmtDate((values as any).contract_date)

	// sug'urta ma'lumotlari (ixtiyoriy)
	const policyNum = dash(values.exp_insurance_number)
	const policyDate = fmtDate(values.exp_insurance_date)

	// fayllar (ixtiyoriy)
	const files = useMemo(
		() => (Array.isArray(values.attachments) ? values.attachments : []),
		[values.attachments]
	)

	return (
		<AdaptableCard className='h-full' bodyClass='h-full'>


			{/*/!* TabBar — preview ichida, lekin boshqaruv parentda *!/*/}
			{/*<TabBar active={activeTab} onChange={onActiveChange} />*/}

			{/* === UZUN MATNLARINGIZ O‘ZGARMAGAN — pastdagi bloklar aynan siz yuborgan holatda === */}
			<div
				style={{
					backgroundColor: '#fff',
					border: '1px solid #D1D5DC',
					color: '#101828',
					padding: 48,
					marginBottom: 4
				}}
			>
				{/* KELISHILDI (o‘ngda) */}
				<div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
					<div style={{ textAlign: 'right', maxWidth: 420 }}>
						<div style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>“KELISHILDI”</div>
						<div>“Marketing va sotishni tashkil etish boshqarmasi” boshlig‘i</div>
						<div
							style={{
								display: 'flex',
								gap: 8,
								justifyContent: 'flex-end',
								alignItems: 'center',
								marginTop: 8
							}}
						>
							<span
								style={{ display: 'inline-block', minWidth: 160, borderBottom: '1px solid #000' }}
							/>
							<span>N.T. Meliboyev</span>
						</div>
						<div style={{ marginTop: 8 }}>“____” __________ 2025 y.</div>
					</div>
				</div>

				{/* Sarlavha */}
				<div style={{ textAlign: 'center', fontWeight: 'bold', letterSpacing: 2, marginBottom: 4 }}>
					R U X S A T N O M A
				</div>
				<div style={{ textAlign: 'center', marginBottom: 16 }}>
					(qiymati 100,0 mln. so‘mdan ortgan texnikalar uchun)
				</div>

				{/* Rekvizitlar bloki — REAL-TIME */}
				<div style={{ lineHeight: 1.6, marginBottom: 16 }}>
					<div>
						<b>Lizing oluvchi manzili:</b>
					</div>
					<div>
						<b>Lizing oluvchi nomi:</b>
					</div>
					<div>
						<b>Lizing obyekti:</b>
					</div>
					<div>
						<b>Lizing shartnomasi raqami va sanasi:</b> {contractNum} — {contractDate}
					</div>
					<div>
						<b>Sug‘urta polisi raqami va sanasi:</b> {policyNum}
						{policyDate !== '—' ? ` — ${policyDate}` : ''}
					</div>
				</div>

				{/* 1-bo‘lim */}
				<div style={{ marginBottom: 16 }}>
					<div style={{ fontWeight: 'bold' }}>1. Moliyaviy-iqtisodiy tahlil boshqarmasi</div>
					<div style={{ marginTop: 4 }}>
						Mazkur lizing oluvchining avval lizingga olingan texnikalar bo‘yicha
						<span
							style={{
								display: 'inline-block',
								minWidth: 140,
								borderBottom: '1px solid #000',
								margin: '0 6px'
							}}
						/>
						sana holatiga ko‘ra lizing to‘lovidan qarzdorligi mavjud emas.
					</div>
					<div style={{ marginTop: 10 }}>Moliyaviy-iqtisodiy tahlil boshqarmasi boshlig‘i</div>
					<div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 8 }}>
						<span
							style={{ display: 'inline-block', minWidth: 180, borderBottom: '1px solid #000' }}
						/>
						<span>E.S. Qurbonov</span>
					</div>
				</div>

				{/* 2-bo‘lim */}
				<div style={{ marginBottom: 16 }}>
					<div style={{ fontWeight: 'bold' }}>2. Buxgalteriya hisobi va hisoboti bo‘limi</div>
					<div style={{ marginTop: 4 }}>
						Mazkur lizing oluvchidan 2025-yil “____”
						<span
							style={{
								display: 'inline-block',
								minWidth: 100,
								borderBottom: '1px solid #000',
								margin: '0 6px'
							}}
						/>
						holatiga
						<span
							style={{
								display: 'inline-block',
								minWidth: 120,
								borderBottom: '1px solid #000',
								margin: '0 6px'
							}}
						/>
						ming so‘m (belgilanganidan kam bo‘lmagan) miqdordagi avans to‘lovi hamda (BHM 160%)
						<span
							style={{
								display: 'inline-block',
								minWidth: 120,
								borderBottom: '1px solid #000',
								margin: '0 6px'
							}}
						/>
						ming so‘m miqdordagi texnikani davlat ro‘yxatiga qo‘yish uchun to‘lov mablag‘lari
						mavjud.
					</div>
					<div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 10 }}>
						<div style={{ minWidth: 140 }}>Bosh mutaxassis</div>
						<span
							style={{ display: 'inline-block', minWidth: 160, borderBottom: '1px solid #000' }}
						/>
					</div>
					<div style={{ marginTop: 6 }}>D.R.Bozorboyev &nbsp;&nbsp;&nbsp; STIR: {'__________'}</div>
				</div>

				{/* 3-bo‘lim */}
				<div style={{ marginBottom: 16 }}>
					<div style={{ fontWeight: 'bold' }}>3. Yuridik bo‘lim</div>
					<div style={{ marginTop: 4 }}>
						Lizing oluvchi bilan tuzilgan lizing shartnomasi va “08.04.2025-yilda tuzilgan
						25/02-4-25-k
						<span
							style={{
								display: 'inline-block',
								minWidth: 90,
								borderBottom: '1px solid #000',
								margin: '0 6px'
							}}
						/>
						-sonli ta’minot (klaster kafilligi, boshqa tashkilot kafilligi, garov) shartnomasining
						bir nusxasi hamda 3 yil lizing muddatiga berilgan.
					</div>
					<div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 10 }}>
						<span
							style={{ display: 'inline-block', minWidth: 140, borderBottom: '1px solid #000' }}
						/>
						<span>(imzo)</span>
					</div>
					<div style={{ marginTop: 6 }}>Sh.J. Xasanov</div>
				</div>

				{/* 4-bo‘lim */}
				<div style={{ marginBottom: 20 }}>
					<div style={{ fontWeight: 'bold' }}>
						4. “Marketing va sotishni tashkil etish boshqarmasi”
					</div>
					<div style={{ marginTop: 4 }}>
						Lizing obyektini xo‘jalikka ajratish bo‘yicha 2025-yil “25.03”-gi 06/409-sonli Filial
						ekspert kengashining qarori mavjud. “TIAN YE PLASTIK” MCHJ
						<span
							style={{
								display: 'inline-block',
								minWidth: 40,
								borderBottom: '1px solid #000',
								margin: '0 6px'
							}}
						/>
						bilan 202
						<span
							style={{
								display: 'inline-block',
								minWidth: 20,
								borderBottom: '1px solid #000',
								margin: '0 6px'
							}}
						/>
						-yil
						<span
							style={{
								display: 'inline-block',
								minWidth: 50,
								borderBottom: '1px solid #000',
								margin: '0 6px'
							}}
						/>
						kuni tuzilgan
						<span
							style={{
								display: 'inline-block',
								minWidth: 70,
								borderBottom: '1px solid #000',
								margin: '0 6px'
							}}
						/>
						-sonli shartnoma asosida
						<span
							style={{
								display: 'inline-block',
								minWidth: 30,
								borderBottom: '1px solid #000',
								margin: '0 6px'
							}}
						/>
						dona texnika ajratildi.
					</div>

					<div style={{ marginTop: 10 }}>
						<div>Boshqarma boshlig‘i o‘rinbosari</div>
						<div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 6 }}>
							<span
								style={{ display: 'inline-block', minWidth: 160, borderBottom: '1px solid #000' }}
							/>
							<span>I. Odiljonov</span>
						</div>
					</div>

					<div style={{ marginTop: 12 }}>
						Ruxsatnoma 2025-yil “_____” __________ kuni “Marketing va sotishni tashkil etish
						boshqarmasi”da
						<span
							style={{
								display: 'inline-block',
								minWidth: 120,
								borderBottom: '1px solid #000',
								margin: '0 6px'
							}}
						/>
						-sonli raqami bilan qayd qilindi.
					</div>
					<div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 8 }}>
						<div>Bosh mutaxassis</div>
						<span
							style={{ display: 'inline-block', minWidth: 160, borderBottom: '1px solid #000' }}
						/>
						<span>SH. Nurmatov</span>
					</div>
				</div>

				{/* Ruxsatnoma bajarilishi sarlavhasi */}
				<div style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: 12 }}>
					Ruxsatnoma bajarilishi
				</div>

				{/* RB – 1 */}
				<div style={{ marginBottom: 16 }}>
					<div style={{ fontWeight: 'bold' }}>
						1. Marketing va sotishni tashkil etish boshqarmasi
					</div>
					<div style={{ marginTop: 4, lineHeight: 1.6 }}>
						Jamiyatning 2025-yil “____” __________ gi _____-sonli ishonchnomasi orqali, “TIAN YE
						PLASTIK” MCHJ ning __________-sonli yuk xati, schyot-fakturasi asosida 2025-yil “____”
						__________ kunidagi Jamiyatning __________-sonli yuk xati bilan mazkur lizing oluvchiga
						_______ dona texnika berildi. <br />
						Ushbu yuk xati, schyot-fakturasi “Buxgalteriya hisobi va hisoboti” bo‘limiga
						topshirildi.
					</div>
					<div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 8 }}>
						<div>Yetakchi mutaxassis</div>
						<span
							style={{ display: 'inline-block', minWidth: 160, borderBottom: '1px solid #000' }}
						/>
						<span>S.S. Saidov</span>
					</div>
					<div>“____” __________ 2025-yil</div>
				</div>

				{/* RB – 2 */}
				<div style={{ marginBottom: 16 }}>
					<div style={{ fontWeight: 'bold' }}>2. Buxgalteriya hisobi va hisoboti bo‘limi</div>
					<div style={{ marginTop: 4 }}>
						Ruxsatnoma bajarilishining 1-bandida ko‘rsatilgan yuk xati, schyot-fakturasi “Marketing
						va sotishni tashkil etish boshqarmasi”dan qabul qilib olindi.
					</div>
					<div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 8 }}>
						<div>Bosh mutaxassis</div>
						<span
							style={{ display: 'inline-block', minWidth: 160, borderBottom: '1px solid #000' }}
						/>
						<span>D.R. Bozorboyev</span>
					</div>
					<div>“____” __________ 2025-yil</div>
				</div>

				{/* RB – 3 */}
				<div style={{ marginBottom: 24 }}>
					<div style={{ fontWeight: 'bold' }}>3. Lizing obyekti monitoring bo‘limi</div>
					<div style={{ marginTop: 4, lineHeight: 1.6 }}>
						____/_______-sonli “Texnikani qabul qilish-topshirish dalolatnomasi” tuzilib, bo‘limda
						____/__________-sonli raqam bilan 2025-yil “_____” __________ kuni qayd qilindi. Mazkur
						texnika bo‘lim monitoringi nazoratiga olindi. Dalolatnoma yig‘ma jildga tikish uchun
						qabul qilib olindi.
					</div>
					<div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 8 }}>
						<div>Bosh mutaxassis</div>
						<span
							style={{ display: 'inline-block', minWidth: 160, borderBottom: '1px solid #000' }}
						/>
						<span>R. Jo‘rayev</span>
					</div>
					<div>“____” __________ 2025-yil</div>
				</div>

				{/* Fayllar */}
				{files.length > 0 && (
					<div style={{ marginTop: 8 }}>
						<div style={{ fontWeight: 500, marginBottom: 6 }}>Biriktirilgan fayllar</div>
						<ul style={{ lineHeight: 1.6 }}>
							{files.map((f) => (
								<li key={f.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
									<span
										style={{
											display: 'inline-block',
											width: 6,
											height: 6,
											borderRadius: 999,
											background: '#4f46e5'
										}}
									/>
									<span
										style={{
											flex: 1,
											overflow: 'hidden',
											textOverflow: 'ellipsis',
											whiteSpace: 'nowrap'
										}}
									>
										{f.name}
									</span>
									<span style={{ color: '#6b7280' }}>{kb(f.size)}</span>
								</li>
							))}
						</ul>
					</div>
				)}

				{/* Pastki eslatma */}
				<div style={{ marginTop: 16 }}>
					Ruxsatnoma shakli Jamiyat Boshqaruvining ____-yil __________ _____-sonli qarori bilan
					tasdiqlangan.
				</div>
			</div>
		</AdaptableCard>
	)
}

export default PaperTrackersPreview
