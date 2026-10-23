import { args } from './args'
import * as cases from './cases'
import { render } from './render'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BaseCheckboxGroup from '../ui/BaseCheckboxGroup.vue'

const meta = {
	title: 'Form/BaseCheckboxGroup',
	component: BaseCheckboxGroup,
	parameters,
	argTypes,
	args,
	render,
} satisfies Meta<typeof BaseCheckboxGroup>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const Vertical = cases.Vertical
export const Theming = cases.Theming
export const Disabled = cases.Disabled
export const WithError = cases.WithError
export const SelectAll = cases.SelectAll
export const InFormField = cases.InFormField
export const Keyboard = cases.Keyboard
export const Animations = cases.Animations
