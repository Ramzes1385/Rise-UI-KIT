import { args } from './args'
import * as cases from './cases'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import BaseBadge from '../ui/BaseBadge.vue'
import type { Meta } from '@storybook/vue3-vite'

const meta = {
	title: 'Element/BaseBadge',
	component: BaseBadge,
	parameters,
	argTypes,
	args,
} satisfies Meta<typeof BaseBadge>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const CustomColor = cases.CustomColor
export const WithIcon = cases.WithIcon
export const LongContent = cases.LongContent
export const Statuses = cases.Statuses
export const InButton = cases.InButton
export const Clickable = cases.Clickable
export const Disabled = cases.Disabled
export const Theming = cases.Theming
export const Animations = cases.Animations
export const Palette = cases.Palette
export const Shapes = cases.Shapes
export const Removable = cases.Removable
