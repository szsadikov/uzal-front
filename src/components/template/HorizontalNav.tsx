import { useAppSelector } from '@/store'
import useResponsive from '@/utils/hooks/useResponsive'
import HorizontalMenuContent from './HorizontalMenuContent'

const HorizontalNav = () => {
	const mode = useAppSelector((state) => state.theme.mode)
	// const userAuthority = useAppSelector((state) => state.auth.user.authority)

	const { larger } = useResponsive()

	return <>{larger.md && <HorizontalMenuContent manuVariant={mode} />}</>
}

export default HorizontalNav
