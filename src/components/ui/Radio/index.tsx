import type { ForwardRefExoticComponent, RefAttributes } from 'react'
import Group from './Group'
import _Radio, { RadioProps } from './Radio'

export type { RadioGroupProps } from './Group'
export type { RadioProps } from './Radio'

type CompoundedComponent = ForwardRefExoticComponent<
	RadioProps & RefAttributes<HTMLHtmlElement>
> & {
	Group: typeof Group
}

const Radio = _Radio as CompoundedComponent

Radio.Group = Group

export { Radio }

export default Radio
