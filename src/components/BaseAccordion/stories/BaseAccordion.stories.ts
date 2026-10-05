import { args } from './args'
import * as cases from './cases'
import { render } from './render'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BaseAccordion from '../ui/BaseAccordion.vue'

const meta = {
	title: 'Data/BaseAccordion',
	component: BaseAccordion,
	parameters,
	argTypes,
	args,
	render,
} satisfies Meta<typeof BaseAccordion>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const CustomColor = cases.CustomColor
export const Customization = cases.Customization
export const Theming = cases.Theming
export const Disabled = cases.Disabled
export const Empty = cases.Empty
export const LongContent = cases.LongContent
export const WithIcons = cases.WithIcons
export const WithSlot = cases.WithSlot
export const Multiple = cases.Multiple
export const OpenModel = cases.OpenModel
export const Keyboard = cases.Keyboard
export const Seo = cases.Seo
export const Animations = cases.Animations
