import { useMemo, useState } from 'react'
import { HiCheck } from 'react-icons/hi'
import classNames from 'classnames'
import dayjs from 'dayjs'
import i18n from 'i18next'
import type { CommonProps } from '@/@types/common'
import Avatar from '@/components/ui/Avatar'
import Dropdown from '@/components/ui/Dropdown'
import Spinner from '@/components/ui/Spinner'
import { dateLocales } from '@/locales'
import { setLang, useAppDispatch, useAppSelector } from '@/store'
import withHeaderItem from '@/utils/hoc/withHeaderItem'

const languageList = [
	// { label: 'English', value: 'en', flag: 'us' },
	{ label: 'РУ', value: 'ru', flag: 'ru' },
	{ label: "UZ", value: 'uz', flag: 'uz' },
	{ label: "ЎЗ", value: 'oz', flag: 'uz' },
]

const LanguageSelector = withHeaderItem(({ className }: CommonProps) => {
	const [loading, setLoading] = useState(false)
	const locale = useAppSelector((state) => state.locale.currentLang)
	const dispatch = useAppDispatch()

	const selectLangFlag = useMemo(() => {
		return languageList.find((lang) => lang.value === locale)?.flag
	}, [locale])

	const selectedLanguage = (
		<div className={classNames(className, 'flex items-center')}>
			{loading ? (
				<Spinner size={20} />
			) : (
				<Avatar size={24} shape='circle' src={`${import.meta.env.BASE_URL}img/countries/${selectLangFlag}.png`} />
			)}
		</div>
	)

	const onLanguageSelect = (lang: string) => {
		const formattedLang = lang.replace(/-([a-z])/g, function (g) {
			return g[1].toUpperCase()
		})

		setLoading(true)

		const dispatchLang = () => {
			i18n.changeLanguage(formattedLang)
			dispatch(setLang(lang))
			setLoading(false)
		}

		dateLocales[formattedLang]()
			.then(() => {
				dayjs.locale(formattedLang)
				dispatchLang()
			})
			.catch(() => {
				dispatchLang()
			})
	}

	return (
		<Dropdown renderTitle={selectedLanguage} placement='bottom-end'>
			{languageList.map((lang) => (
				<Dropdown.Item
					key={`${lang.label}_${lang.value}`}
					className='mb-1 justify-between'
					eventKey={lang.label}
					onClick={() => onLanguageSelect(lang.value)}
				>
					<span className='flex items-center'>
						<Avatar size={18} shape='circle' src={`${import.meta.env.BASE_URL}img/countries/${lang.flag}.png`} />
						<span className='ltr:ml-2 rtl:mr-2'>{lang.label}</span>
					</span>
					{locale === lang.value && <HiCheck className='text-lg text-emerald-500' />}
				</Dropdown.Item>
			))}
		</Dropdown>
	)
})

export default LanguageSelector
