import { args } from './args'
import * as cases from './cases'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import BaseBanner from '../ui/BaseBanner.vue'
import type { Meta } from '@storybook/vue3-vite'

const meta = {
	title: 'Element/BaseBanner',
	component: BaseBanner,
	parameters,
	argTypes,
	args,
} satisfies Meta<typeof BaseBanner>

export default meta

export const Default = cases.Default
export const Types = cases.Types
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const CustomColor = cases.CustomColor
export const WithAction = cases.WithAction
export const Dismissible = cases.Dismissible
export const Remembered = cases.Remembered
export const Sticky = cases.Sticky
export const LongContent = cases.LongContent
export const Keyboard = cases.Keyboard
export const Theming = cases.Theming
export const Animations = cases.Animations
