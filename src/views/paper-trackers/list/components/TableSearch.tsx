import { useEffect, useState } from 'react'
import { HiOutlineSearch } from 'react-icons/hi'
import { Input } from '@/components/ui'

type Props = {
	value?: string
	onChange: (val?: string) => void
	delay?: number
	className?: string
}

const TableSearch = ({ value, onChange, delay = 500, className }: Props) => {
	const [input, setInput] = useState(value)

	useEffect(() => {
		const timeout = setTimeout(() => {
			onChange(input)
		}, delay)

		return () => clearTimeout(timeout)
	}, [input])

	return (
		<Input
			className={`w-full ${className || ''}`}
			size='sm'
			placeholder='Поиск'
			prefix={<HiOutlineSearch className='text-lg' />}
			onChange={(e) => setInput(e.target.value)}
			value={input}
		/>
	)
}

export default TableSearch
