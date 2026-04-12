import { type ChangeEvent, useEffect, useRef, useState } from 'react'
import Highlighter from 'react-highlight-words'
import { HiChevronRight, HiOutlineSearch } from 'react-icons/hi'
import { Link } from 'react-router-dom'
import classNames from 'classnames'
import debounce from 'lodash/debounce'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import navigationIcon from '@/configs/navigation-icon.config'
import withHeaderItem from '@/utils/hoc/withHeaderItem'
import useThemeClass from '@/utils/hooks/useThemeClass'

type SearchData = {
	title: string
	url: string
	icon: string
	category: string
	categoryTitle: string
}

type SearchResult = {
	title: string
	data: SearchData[]
}

const recommendedSearch: SearchResult[] = [
	{
		title: 'Recommended',
		data: []
	}
]

const ListItem = (props: {
	icon: string
	label: string
	url: string
	isLast?: boolean
	keyWord: string
	onNavigate: () => void
}) => {
	const { icon, label, url = '', isLast, keyWord, onNavigate } = props

	const { textTheme } = useThemeClass()

	return (
		<Link to={url} onClick={onNavigate}>
			<div
				className={classNames(
					'user-select flex cursor-pointer items-center justify-between rounded-lg p-3.5',
					'bg-gray-50 hover:bg-gray-100 dark:bg-gray-700/60 dark:hover:bg-gray-700/90',
					!isLast && 'mb-3'
				)}
			>
				<div className='flex items-center'>
					<div
						className={classNames(
							'mr-4 flex h-6 w-6 items-center justify-center rounded-md bg-white text-xl shadow-xs ring-1 ring-slate-900/5 group-hover:shadow-sm dark:bg-gray-700',
							textTheme,
							'dark:text-gray-100'
						)}
					>
						{icon && navigationIcon[icon]}
					</div>
					<div className='text-gray-900 dark:text-gray-300'>
						<Highlighter
							autoEscape
							highlightClassName={classNames(
								textTheme,
								'underline bg-transparent font-semibold dark:text-white'
							)}
							searchWords={[keyWord]}
							textToHighlight={label}
						/>
					</div>
				</div>
				<HiChevronRight className='text-lg' />
			</div>
		</Link>
	)
}

const Search = withHeaderItem(({ className }: { className?: string }) => {
	const [searchDialogOpen, setSearchDialogOpen] = useState(false)
	const [searchResult, setSearchResult] = useState<SearchResult[]>(recommendedSearch)
	const [noResult, setNoResult] = useState(false)

	const inputRef = useRef<HTMLInputElement>(null)

	const handleReset = () => {
		setNoResult(false)
		setSearchResult(recommendedSearch)
	}

	const handleSearchOpen = () => {
		setSearchDialogOpen(true)
	}

	const handleSearchClose = () => {
		setSearchDialogOpen(false)
		if (noResult) {
			setTimeout(() => {
				handleReset()
			}, 300)
		}
	}

	const debounceFn = debounce(handleDebounceFn, 200)

	async function handleDebounceFn(query: string) {
		if (!query) {
			setSearchResult(recommendedSearch)

			return
		}

		if (noResult) {
			setNoResult(false)
		}
		// Fetch search result
	}

	const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
		debounceFn(e.target.value)
	}

	useEffect(() => {
		if (searchDialogOpen) {
			const timeout = setTimeout(() => inputRef.current?.focus(), 100)

			return () => {
				clearTimeout(timeout)
			}
		}
	}, [searchDialogOpen])

	const handleNavigate = () => {
		handleSearchClose()
	}

	return (
		<>
			<div className={classNames(className, 'text-2xl')} onClick={handleSearchOpen}>
				<HiOutlineSearch />
			</div>
			<Dialog
				contentClassName='p-0'
				isOpen={searchDialogOpen}
				closable={false}
				onRequestClose={handleSearchClose}
			>
				<div>
					<div className='flex items-center justify-between border-b border-gray-200 px-4 dark:border-gray-600'>
						<div className='flex items-center'>
							<HiOutlineSearch className='text-xl' />
							<input
								ref={inputRef}
								className='block w-full bg-transparent p-4 text-base text-gray-900 ring-0 outline-hidden dark:text-gray-100'
								placeholder='Search...'
								onChange={handleSearch}
							/>
						</div>
						<Button size='xs' onClick={handleSearchClose}>
							Esc
						</Button>
					</div>
					<div className='max-h-[550px] overflow-y-auto px-5 py-6'>
						{searchResult.map((result) => (
							<div key={result.title} className='mb-6'>
								<h6 className='mb-3'>{result.title}</h6>
								{result.data.map((data, index) => (
									<ListItem
										key={data.title + index}
										icon={data.icon}
										label={data.title}
										url={data.url}
										keyWord={inputRef.current?.value || ''}
										onNavigate={handleNavigate}
									/>
								))}
							</div>
						))}
						{searchResult.length === 0 && noResult && (
							<div className='my-10 text-center text-lg'>
								<span>No results for </span>
								<span className='heading-text'>
									{`'`}
									{inputRef.current?.value}
									{`'`}
								</span>
							</div>
						)}
					</div>
				</div>
			</Dialog>
		</>
	)
})

export default Search
