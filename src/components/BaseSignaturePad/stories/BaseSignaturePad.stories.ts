import { args } from './args'
import * as cases from './cases'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BaseSignaturePad from '../ui/BaseSignaturePad.vue'

const meta = {
	title: 'Form/BaseSignaturePad',
	component: BaseSignaturePad,
	parameters,
	argTypes,
	args,
} satisfies Meta<typeof BaseSignaturePad>

export default meta

export const Default = cases.Default
export const Signed = cases.Signed
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const CustomColor = cases.CustomColor
export const Disabled = cases.Disabled
export const WithError = cases.WithError
export const Export = cases.Export
export const Theming = cases.Theming
export const Animations = cases.Animations
