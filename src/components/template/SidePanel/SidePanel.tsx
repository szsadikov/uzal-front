import { HiOutlineCog } from 'react-icons/hi'
import classNames from 'classnames'
import type { CommonProps } from '@/@types/common'
import Drawer from '@/components/ui/Drawer'
import { setPanelExpand, useAppDispatch, useAppSelector } from '@/store'
import withHeaderItem from '@/utils/hoc/withHeaderItem'
import SidePanelContent, { SidePanelContentProps } from './SidePanelContent'

type SidePanelProps = SidePanelContentProps & CommonProps

const _SidePanel = (props: SidePanelProps) => {
	// eslint-disable-next-line react-hooks/rules-of-hooks
	const dispatch = useAppDispatch()

	const { className, ...rest } = props

	// eslint-disable-next-line react-hooks/rules-of-hooks
	const panelExpand = useAppSelector((state) => state.theme.panelExpand)

	// eslint-disable-next-line react-hooks/rules-of-hooks
	const direction = useAppSelector((state) => state.theme.direction)

	const openPanel = () => {
		dispatch(setPanelExpand(true))
	}

	const closePanel = () => {
		dispatch(setPanelExpand(false))
		const bodyClassList = document.body.classList
		if (bodyClassList.contains('drawer-lock-scroll')) {
			bodyClassList.remove('drawer-lock-scroll', 'drawer-open')
		}
	}

	return (
		<>
			<div className={classNames('text-2xl', className)} onClick={openPanel} {...rest}>
				<HiOutlineCog />
			</div>
			<Drawer
				title='Theme Config'
				isOpen={panelExpand}
				placement={direction === 'rtl' ? 'left' : 'right'}
				width={375}
				onClose={closePanel}
				onRequestClose={closePanel}
			>
				<SidePanelContent callBackClose={closePanel} />
			</Drawer>
		</>
	)
}

const SidePanel = withHeaderItem(_SidePanel)

export default SidePanel
