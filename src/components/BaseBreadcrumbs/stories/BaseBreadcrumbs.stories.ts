import { args } from './args'
import * as cases from './cases'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BaseBreadcrumbs from '../ui/BaseBreadcrumbs.vue'

const meta = {
	title: 'Navigation/BaseBreadcrumbs',
	component: BaseBreadcrumbs,
	parameters,
	argTypes,
	args,
} satisfies Meta<typeof BaseBreadcrumbs>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const Separators = cases.Separators
export const CustomColor = cases.CustomColor
export const Empty = cases.Empty
export const LongContent = cases.LongContent
export const WithIcons = cases.WithIcons
export const WithHome = cases.WithHome
export const CustomSlots = cases.CustomSlots
export const Collapsed = cases.Collapsed
export const Keyboard = cases.Keyboard
export const Seo = cases.Seo
export const Theming = cases.Theming
export const Animations = cases.Animations
