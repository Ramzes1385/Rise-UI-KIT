import { args } from './args'
import * as cases from './cases'
import { render } from './render'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BaseInputNumber from '../ui/BaseInputNumber.vue'

const meta = {
	title: 'Form/BaseInputNumber',
	component: BaseInputNumber,
	parameters,
	argTypes,
	args,
	render,
} satisfies Meta<typeof BaseInputNumber>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const Disabled = cases.Disabled
export const WithError = cases.WithError
export const Readonly = cases.Readonly
export const DecimalStep = cases.DecimalStep
export const Keyboard = cases.Keyboard
export const Theming = cases.Theming
export const Animations = cases.Animations
