import type { ForwardRefExoticComponent, RefAttributes } from 'react'
import Addon from './Addon'
import _InputGroup, { InputGroupProps } from './InputGroup'

export type { AddonProps } from './Addon'
export type { InputGroupProps } from './InputGroup'

type CompoundedComponent = ForwardRefExoticComponent<
	InputGroupProps & RefAttributes<HTMLDivElement>
> & {
	Addon: typeof Addon
}

const InputGroup = _InputGroup as CompoundedComponent

InputGroup.Addon = Addon

export { InputGroup }

export default InputGroup
