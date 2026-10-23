import { args } from './args'
import * as cases from './cases'
import { render } from './render'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BaseFormField from '../ui/BaseFormField.vue'

const meta = {
	title: 'Form/BaseFormField',
	component: BaseFormField,
	parameters,
	argTypes,
	args,
	render,
} satisfies Meta<typeof BaseFormField>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const Theming = cases.Theming
export const WithError = cases.WithError
export const LongContent = cases.LongContent
export const KitControl = cases.KitControl
export const LabelFor = cases.LabelFor
export const ToggleControls = cases.ToggleControls
export const Animations = cases.Animations
