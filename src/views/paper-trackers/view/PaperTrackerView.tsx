// src/pages/paper-trackers/view/PaperTrackerView.tsx
import './index.css'                                                   // read-only va boshqa global klasslar

import { useState } from 'react'
import PaperTrackersPreview from '../add/PaperTrackersPreview'        // Preview fayling real yo'liga mos (zip ichida add/ ichida)
import ExpeditorTab from '../Tabs/components/ExpeditorTab'            // Hozircha faqat expeditor uchun "Данные"
import SidebarFiles from './SidebarFiles'                              // O'ng paneldagi "fayllar ro'yxati" (document rejimida ishlatamiz)

// Agar yuqorida import yo'llari boshqacha bo'lsa, zip tuzilmasiga moslab to'g'rilab qo'ying:
//  - Preview:       paper-trackers/add/PaperTrackersPreview.tsx
//  - ExpeditorTab:  paper-trackers/Tabs/components/ExpeditorTab.tsx
//  - SidebarFiles:  paper-trackers/view/SidebarFiles.tsx
//  - index.css:     paper-trackers/view/index.css

type AttachedFile = { id: number | string; name: string; size?: string; url: string; preview?: string }

// ⬇️ Bu komponentni view sahifangda (routingdan) chaqirasan
export default function PaperTrackerView() {
	// Sizda bu qiymatlar Formik yoki store dan keladi — hozir demo sifatida local state
	const [values] = useState<any>({})
	const [activeTab, setActiveTab] = useState<
		'expeditor' | 'financier' | 'accountant' | 'lawyer' | 'marketing' | 'monitoring' | 'zamdep'
	>('expeditor')

	// "Документ / Данные" rejimi — talabingiz bo‘yicha
	const [mode, setMode] = useState<'document' | 'data'>('data')

	// 🔗 Biriktirilgan fayllar: hozircha mock; o'zingiz API dan to'ldirasiz
	const attachedFiles: AttachedFile[] = [
		// { id: 1, name: 'Файл.pdf', size: '145 кб', url: '/file1.pdf', preview: '/thumb1.png' },
		// { id: 2, name: 'Файл.pdf', size: '132 кб', url: '/file2.pdf', preview: '/thumb2.png' },
		// { id: 3, name: 'Файл.pdf', size: '128 кб', url: '/file3.pdf', preview: '/thumb3.png' },
	]

	return (
		<div className="grid grid-cols-12 gap-6">
			{/* LEFT */}
			<div className="col-span-12 xl:col-span-9 space-y-4">
				{/* Yuqoridagi ro‘l tablari bor bo'lsa — qoldiring; hozir expeditor default */}

				{/* Dok/Dannie tugmalari */}
				<div className="flex gap-3">
					<button
						onClick={() => setMode('document')}
						className={`px-4 h-11 rounded-md ${mode === 'document' ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}
					>
						Документ
					</button>
					<button
						onClick={() => setMode('data')}
						className={`px-4 h-11 rounded-md ${mode === 'data' ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}
					>
						Данные
					</button>
				</div>

				{/* Chapdagi asosiy kontent */}
				{mode === 'document' ? (
					// ✅ Siz aytgandek aynan shu props bilan
					<PaperTrackersPreview
						values={values}
						activeTab={activeTab}
						onActiveChange={setActiveTab}
					/>
				) : (
					// ✅ Данные rejimi: O'ng sidebar umuman ko'rinmaydi; expeditor "Данные" tarkibi + (pastroqda grid bo'lsa) fayllar
					<>
						<ExpeditorTab />
						{/* Agar “Данные”da fayllar pastda grid bo'lsin desangiz — kommentdan chiqarasiz */}
						{/* <FilesGallery files={attachedFiles} /> */}
					</>
				)}
			</div>

			{/* RIGHT (sidebar) — ❗️faqat DOCUMENT rejimida */}
			<div className="col-span-12 xl:col-span-3">
				{mode === 'document' ? (
					// Bu yerda sizning amaldagi o‘ng panelingiz (polis inputlari, “Прикрепить файл” tugmasi va h.k.)
					// Agar o'ng panelingiz hali alohida komponent bo'lmasa, mana shu SidebarFiles orqali hozircha ro'yxatni ko'rsatishingiz mumkin:
					<SidebarFiles files={attachedFiles} />
				) : null}
			</div>
		</div>
	)
}
