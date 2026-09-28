import { args } from './args'
import * as cases from './cases'
import { render } from './render'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BaseDatePicker from '../ui/BaseDatePicker.vue'

const meta = {
	title: 'Form/BaseDatePicker',
	component: BaseDatePicker,
	parameters,
	argTypes,
	args,
	render,
} satisfies Meta<typeof BaseDatePicker>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const CustomColor = cases.CustomColor
export const Empty = cases.Empty
export const WithError = cases.WithError
export const Disabled = cases.Disabled
export const Clearable = cases.Clearable
export const RangeSelection = cases.RangeSelection
export const MultipleSelection = cases.MultipleSelection
export const WithTime = cases.WithTime
export const Constraints = cases.Constraints
export const WeekNumbers = cases.WeekNumbers
export const CustomIcon = cases.CustomIcon
export const Keyboard = cases.Keyboard
