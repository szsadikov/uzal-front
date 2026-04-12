// src/pages/.../Tabs.tsx

export type TabKey =
	| 'expeditor'
	| 'financier'
	| 'accountant'
	| 'lawyer'
	| 'marketing'
	| 'monitoring'
	| 'zamdep'

export const TABS: { key: TabKey; label: string }[] = [
	{ key: 'expeditor', label: 'Экспедитор' },
	{ key: 'financier', label: 'Финансист' },
	{ key: 'accountant', label: 'Бухгалтер' },
	{ key: 'lawyer', label: 'Юрист' },
	{ key: 'marketing', label: 'Маркетинг' },
	{ key: 'monitoring', label: 'Мониторинг' },
	{ key: 'zamdep', label: 'Зампред' }
]

export function TabBar({ active, onChange }: { active: TabKey; onChange: (k: TabKey) => void }) {
	return (
		<div className='mb-4 border-b border-gray-300'>
			<div className='flex gap-6 overflow-x-auto'>
				{TABS.map((t) => (
					<button
						key={t.key}
						type='button'
						onClick={() => onChange(t.key)}
						className={`relative pb-2 text-sm font-medium whitespace-nowrap ${
							active === t.key ? 'text-indigo-600' : 'text-gray-700 hover:text-gray-900'
						}`}
					>
						{t.label}
						{active === t.key && (
							<span className='absolute -bottom-[1px] left-0 h-0.5 w-full bg-indigo-600' />
						)}
					</button>
				))}
			</div>
		</div>
	)
}
