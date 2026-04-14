import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import DatePickerRange from '@/components/ui/DatePicker/DatePickerRange'

export type DateRange = {
	from: string
	to: string
}

type Preset = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom'

type Props = {
	value: DateRange
	onChange: (range: DateRange) => void
}

const todayStr = () => dayjs().format('YYYY-MM-DD')

function getPresetRange(preset: Exclude<Preset, 'custom'>): DateRange {
	const to = todayStr()
	switch (preset) {
		case 'today':
			return { from: to, to }
		case 'week':
			return { from: dayjs().startOf('week').format('YYYY-MM-DD'), to }
		case 'month':
			return { from: dayjs().startOf('month').format('YYYY-MM-DD'), to }
		case 'quarter': {
			const m = dayjs().month()
			const quarterStart = Math.floor(m / 3) * 3

			return { from: dayjs().month(quarterStart).startOf('month').format('YYYY-MM-DD'), to }
		}
		case 'year':
			return { from: dayjs().startOf('year').format('YYYY-MM-DD'), to }
	}
}

function toDate(str: string): Date | null {
	const d = dayjs(str)

	return d.isValid() ? d.toDate() : null
}

const PRESET_KEYS: { key: Exclude<Preset, 'custom'>; i18nKey: string }[] = [
	{ key: 'today',   i18nKey: 'marketing.filter.today'   },
	{ key: 'week',    i18nKey: 'marketing.filter.week'    },
	{ key: 'month',   i18nKey: 'marketing.filter.month'   },
	{ key: 'quarter', i18nKey: 'marketing.filter.quarter' },
	{ key: 'year',    i18nKey: 'marketing.filter.year'    },
]

export default function DateRangeFilter({ value, onChange }: Props) {
	const { t } = useTranslation()
	const [activePreset, setActivePreset] = useState<Preset>('year')

	// Internal picker value — allows partial selection (first date only) without resetting
	const [pickerValue, setPickerValue] = useState<[Date | null, Date | null]>([
		toDate(value.from),
		toDate(value.to),
	])

	// Sync picker when preset buttons change the value externally
	useEffect(() => {
		setPickerValue([toDate(value.from), toDate(value.to)])
	}, [value.from, value.to])

	const handlePreset = (preset: Exclude<Preset, 'custom'>) => {
		setActivePreset(preset)
		onChange(getPresetRange(preset))
	}

	const handleRangeChange = (dates: [Date | null, Date | null]) => {
		const [from, to] = dates
		// Always update internal picker state so partial selection is preserved
		setPickerValue([from, to])

		if (from && to) {
			// Both dates selected — propagate to parent
			setActivePreset('custom')
			onChange({
				from: dayjs(from).format('YYYY-MM-DD'),
				to: dayjs(to).format('YYYY-MM-DD'),
			})
		} else if (!from && !to) {
			// Clear button pressed — reset to year
			const yearRange = getPresetRange('year')
			setActivePreset('year')
			onChange(yearRange)
		}
	}

	return (
		<div className='flex flex-wrap items-center gap-2'>
			{PRESET_KEYS.map(({ key, i18nKey }) => (
				<button
					key={key}
					type='button'
					onClick={() => handlePreset(key)}
					className={[
						'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
						activePreset === key
							? 'bg-indigo-600 text-white shadow-sm'
							: 'bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700 dark:hover:bg-gray-700'
					].join(' ')}
				>
					{t(i18nKey)}
				</button>
			))}

			<div className='ml-auto'>
				<DatePickerRange
					inputFormat='DD.MM.YYYY'
					separator='–'
					value={pickerValue}
					onChange={(dates) => handleRangeChange(dates as [Date | null, Date | null])}
				/>
			</div>
		</div>
	)
}
