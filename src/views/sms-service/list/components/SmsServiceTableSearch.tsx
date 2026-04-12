import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { HiOutlineSearch } from 'react-icons/hi'
import { Input } from '@/components/ui'

type Props = {
	value?: string
	onChange: (val?: string) => void
	delay?: number
}

const SmsServiceTableSearch = ({ value, onChange, delay = 500 }: Props) => {
	const { t } = useTranslation()
	const [input, setInput] = useState(value)

	useEffect(() => {
		const timeout = setTimeout(() => {
			onChange(input)
		}, delay)

		return () => clearTimeout(timeout)
	}, [input])

	return (
		<Input
			className='mb-4 max-w-md md:mb-0 md:w-52'
			size='sm'
			placeholder={t('Поиск')}
			prefix={<HiOutlineSearch className='text-lg' />}
			onChange={(e) => setInput(e.target.value)}
			value={input}
		/>
	)
}

export default SmsServiceTableSearch
