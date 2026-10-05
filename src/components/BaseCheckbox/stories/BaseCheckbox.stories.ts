import { args } from './args'
import * as cases from './cases'
import { render } from './render'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BaseCheckbox from '../ui/BaseCheckbox.vue'

const meta = {
	title: 'Form/BaseCheckbox',
	component: BaseCheckbox,
	parameters,
	argTypes,
	args,
	render,
} satisfies Meta<typeof BaseCheckbox>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const CustomColor = cases.CustomColor
export const Theming = cases.Theming
export const Disabled = cases.Disabled
export const WithError = cases.WithError
export const Indeterminate = cases.Indeterminate
export const LongContent = cases.LongContent
export const ErrorSlot = cases.ErrorSlot
export const ConsentBeforeSubmit = cases.ConsentBeforeSubmit
export const Keyboard = cases.Keyboard
export const AriaLabel = cases.AriaLabel
export const Animations = cases.Animations
