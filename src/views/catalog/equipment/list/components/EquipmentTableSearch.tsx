import { useEffect, useRef, useState } from 'react'
import { HiOutlineSearch } from 'react-icons/hi'
import { Input } from '@/components/ui'
import { useTranslation } from 'react-i18next'

type Props = {
	value?: string
	onChange: (val?: string) => void
	delay?: number
}

const EquipmentTableSearch = ({ value, onChange, delay = 500 }: Props) => {
	const [input, setInput] = useState(value ?? '')
	const firstRenderRef = useRef(true)
	const timeoutRef = useRef<number | null>(null)
	const { t } = useTranslation()

	// parentdan value o'zgarganda input-ni sync qiladi
	useEffect(() => {
		setInput(value ?? '')
	}, [value])

	// Debounce ishlashi — faqat real input yozilganda
	useEffect(() => {

		if (firstRenderRef.current) {
			firstRenderRef.current = false

			return
		}

		// 2️⃣ input o'zgarganda debounced onChange
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current)
		}

		timeoutRef.current = window.setTimeout(() => {
			onChange(input || undefined)
		}, delay)

		return () => {
			if (timeoutRef.current) clearTimeout(timeoutRef.current)
		}
	}, [input])

	return (
		<Input
			className='mb-4 max-w-md md:mb-0 md:w-52'
			size='sm'
			placeholder={t('Поиск')}
			prefix={<HiOutlineSearch className='text-lg' />}
			value={input}
			onChange={(e) => setInput(e.target.value)}
		/>
	)
}

export default EquipmentTableSearch
