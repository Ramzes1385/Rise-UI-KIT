import { args } from './args'
import * as cases from './cases'
import { render } from './render'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BaseCardInput from '../ui/BaseCardInput.vue'

const meta = {
	title: 'Form/BaseCardInput',
	component: BaseCardInput,
	render,
	parameters,
	argTypes,
	args,
} satisfies Meta<typeof BaseCardInput>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const CustomColor = cases.CustomColor
export const Inline = cases.Inline
export const Disabled = cases.Disabled
export const WithError = cases.WithError
export const Errors = cases.Errors
export const AllBrands = cases.AllBrands
export const WithoutHolder = cases.WithoutHolder
export const WithPreview = cases.WithPreview
export const PreviewBackground = cases.PreviewBackground
export const Accepted = cases.Accepted
export const InForm = cases.InForm
export const Keyboard = cases.Keyboard
