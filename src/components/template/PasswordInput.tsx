import { useState } from 'react'
import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi'
import { FieldProps } from 'formik'
import Input from '@/components/ui/Input'

interface Props extends FieldProps {
	placeholder?: string
}

const PasswordField = ({ field, form, placeholder }: Props) => {
	const [showPassword, setShowPassword] = useState(false)

	const toggleVisibility = () => {
		setShowPassword(!showPassword)
	}

	const inputIcon = (
		<span className='cursor-pointer' onClick={toggleVisibility}>
			{showPassword ? <HiOutlineEye /> : <HiOutlineEyeOff />}
		</span>
	)

	return (
		<Input
			{...field}
			type={showPassword ? 'text' : 'password'}
			suffix={inputIcon}
			placeholder={placeholder}
			invalid={Boolean(form.touched[field.name] && form.errors[field.name])}
		/>
	)
}

export default PasswordField
