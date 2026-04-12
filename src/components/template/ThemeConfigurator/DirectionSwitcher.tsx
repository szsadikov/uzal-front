import type { Direction } from '@/@types/theme'
import Button from '@/components/ui/Button'
import InputGroup from '@/components/ui/InputGroup'
import { THEME_ENUM } from '@/constants/theme.constant'
import useDirection from '@/utils/hooks/useDirection'

const dirList = [
	{ value: THEME_ENUM.DIR_LTR, label: 'LTR' },
	{ value: THEME_ENUM.DIR_RTL, label: 'RTL' }
]

const DirectionSwitcher = ({ callBackClose }: { callBackClose?: () => void }) => {
	const [direction, updateDirection] = useDirection()

	const onDirChange = (val: Direction) => {
		updateDirection(val)
		callBackClose?.()
	}

	return (
		<InputGroup size='sm'>
			{dirList.map((dir) => (
				<Button
					key={dir.value}
					active={direction === dir.value}
					onClick={() => onDirChange(dir.value)}
				>
					{dir.label}
				</Button>
			))}
		</InputGroup>
	)
}

export default DirectionSwitcher
