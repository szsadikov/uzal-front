import type { ForwardRefExoticComponent, RefAttributes } from 'react'
import StepItem from './StepItem'
import _Steps, { StepsProps } from './Steps'

export type { StepItemProps } from './StepItem'
export type { StepsProps } from './Steps'

type CompoundedComponent = ForwardRefExoticComponent<StepsProps & RefAttributes<HTMLDivElement>> & {
	Item: typeof StepItem
}

const Steps = _Steps as CompoundedComponent

Steps.Item = StepItem

export { Steps }

export default Steps
