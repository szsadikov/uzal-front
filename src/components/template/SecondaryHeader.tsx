import classNames from 'classnames'
import type { CommonProps } from '@/@types/common'
import HorizontalMenuContent from '@/components/template/HorizontalMenuContent'
import { NAV_MODE_THEMED } from '@/constants/theme.constant'
import { useAppSelector } from '@/store'
import useResponsive from '@/utils/hooks/useResponsive'

interface SecondaryHeaderProps extends CommonProps {
	contained: boolean
}

const SecondaryHeader = (props: SecondaryHeaderProps) => {
	const { className, contained } = props

	const navMode = useAppSelector((state) => state.theme.navMode)
	const themeColor = useAppSelector((state) => state.theme.themeColor)
	const primaryColorLevel = useAppSelector((state) => state.theme.primaryColorLevel)
	// const userAuthority = useAppSelector((state) => state.auth.user.authority)

	const { larger } = useResponsive()

	const headerColor = () => {
		if (navMode === NAV_MODE_THEMED) {
			return `bg-${themeColor}-${primaryColorLevel} secondary-header-${navMode}`
		}

		return `secondary-header-${navMode}`
	}

	return (
		<>
			{larger.md && (
				<div className={classNames('flex h-16 items-center', headerColor(), className)}>
					<div className={classNames('flex items-center px-4', contained && 'container mx-auto')}>
						<HorizontalMenuContent manuVariant={navMode} />
					</div>
				</div>
			)}
		</>
	)
}

export default SecondaryHeader
