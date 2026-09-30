import { args } from './args'
import * as cases from './cases'
import { render } from './render'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import BaseRating from '../ui/BaseRating.vue'
import type { Meta } from '@storybook/vue3-vite'

const meta = {
	title: 'Form/BaseRating',
	component: BaseRating,
	parameters,
	argTypes,
	args,
	render,
} satisfies Meta<typeof BaseRating>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const CustomColor = cases.CustomColor
export const Readonly = cases.Readonly
export const Disabled = cases.Disabled
export const CustomIcons = cases.CustomIcons
export const InFormField = cases.InFormField
export const HalfStars = cases.HalfStars
export const HoverPreview = cases.HoverPreview
export const Precise = cases.Precise
export const Keyboard = cases.Keyboard
export const Seo = cases.Seo
