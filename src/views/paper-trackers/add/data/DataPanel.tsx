import React from 'react'
import type { FormikValues } from '../PaperTrackersAdd'            // type-only import
import type { TabKey } from '../PaperTrackersPreview'
import DataAccountant from './DataAccountant'
import DataExpeditor from './DataExpeditor'
import DataFinancier from './DataFinancier'
import DataLawyer from './DataLawyer'
import DataMarketing from './DataMarketing'
import DataMonitoring from './DataMonitoring'
import DataZamdep from './DataZamdep'

const TAB_LABEL: Record<TabKey, string> = {
	expeditor: 'Экспедитор',
	financier: 'Финансист',
	accountant: 'Бухгалтер',
	lawyer: 'Юрист',
	marketing: 'Маркетинг',
	monitoring: 'Мониторинг',
	zamdep: 'Зампред',
}

// kichik UI helperlar
const Field = ({ label, value }: { label: string; value?: React.ReactNode }) => (
	<div className="space-y-1">
		<div className="text-gray-500 text-sm">{label}</div>
		<div className="text-gray-900 font-medium">{value ?? '—'}</div>
	</div>
)
export const yesNo = (v?: boolean | string) =>
	typeof v === 'boolean' ? (v ? 'Да' : 'Нет') : (String(v ?? '').trim() || '—')

// files preview (read-only)
function FilesGrid({ values }: { values: FormikValues }) {
	if (!Array.isArray(values.attachments) || values.attachments.length === 0) return null
	return (
		<div className="rounded-xl border border-gray-200 bg-white p-4">
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{values.attachments.map((f) => (
					<div key={f.id} className="rounded-xl border border-gray-200 p-4 transition hover:shadow-sm" title={f.name}>
						<div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg border bg-gray-50 text-sm text-gray-400">
							PDF
						</div>
						<div className="mt-3 truncate text-center text-xs text-gray-500">{f.name}</div>
					</div>
				))}
			</div>
		</div>
	)
}

const REGISTRY: Record<TabKey, React.FC<{ values: FormikValues; Field: typeof Field; yesNo: typeof yesNo }>> = {
	expeditor: DataExpeditor,
	financier: DataFinancier,
	accountant: DataAccountant,
	lawyer: DataLawyer,
	marketing: DataMarketing,
	monitoring: DataMonitoring,
	zamdep: DataZamdep,
}

export default function DataPanel({ tab, values }: { tab: TabKey; values: FormikValues }) {
	const Comp = REGISTRY[tab]
	const title = TAB_LABEL[tab]

	return (
		<>
			<div className="mb-4 rounded-xl border border-gray-200 bg-white p-4">
				<div className="mb-3 flex items-center gap-2 text-sm text-gray-600">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs text-white">
            {title?.[0] ?? '•'}
          </span>
					<span className="font-medium text-gray-900">{title}</span>
				</div>
				<Comp values={values} Field={Field} yesNo={yesNo} />
			</div>

			<FilesGrid values={values} />
		</>
	)
}
