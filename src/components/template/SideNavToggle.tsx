import type { CommonProps } from '@/@types/common'
import NavToggle from '@/components/shared/NavToggle'
import { setSideNavCollapse, useAppDispatch, useAppSelector } from '@/store'
import withHeaderItem from '@/utils/hoc/withHeaderItem'
import useResponsive from '@/utils/hooks/useResponsive'

const SideNavToggle = withHeaderItem(({ className }: CommonProps) => {
	const sideNavCollapse = useAppSelector((state) => state.theme.layout.sideNavCollapse)
	const dispatch = useAppDispatch()

	const { larger } = useResponsive()

	const onCollapse = () => {
		dispatch(setSideNavCollapse(!sideNavCollapse))
	}

	return (
		<>
			{larger.md && (
				<div className={className} onClick={onCollapse}>
					<NavToggle className='text-2xl' toggled={sideNavCollapse} />
				</div>
			)}
		</>
	)
})

export default SideNavToggle
