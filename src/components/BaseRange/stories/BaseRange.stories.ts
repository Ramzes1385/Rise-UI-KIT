import { args } from './args'
import * as cases from './cases'
import { render } from './render'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import BaseRange from '../ui/BaseRange.vue'
import type { Meta } from '@storybook/vue3-vite'

const meta = {
	title: 'Form/BaseRange',
	component: BaseRange,
	parameters,
	argTypes,
	args,
	render,
} satisfies Meta<typeof BaseRange>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const CustomColor = cases.CustomColor
export const Theming = cases.Theming
export const Disabled = cases.Disabled
export const Range = cases.Range
export const MultiPoint = cases.MultiPoint
export const Vertical = cases.Vertical
export const WithTooltip = cases.WithTooltip
export const WithMarks = cases.WithMarks
export const DecimalStep = cases.DecimalStep
export const CustomThumb = cases.CustomThumb
export const Keyboard = cases.Keyboard
export const RangeKeyboard = cases.RangeKeyboard
export const OutOfBounds = cases.OutOfBounds
export const Animations = cases.Animations
