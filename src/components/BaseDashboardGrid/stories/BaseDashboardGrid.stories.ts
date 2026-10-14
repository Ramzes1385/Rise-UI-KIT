import { args } from './args'
import * as cases from './cases'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BaseDashboardGrid from '../ui/BaseDashboardGrid.vue'

const meta = {
	title: 'Layout/BaseDashboardGrid',
	component: BaseDashboardGrid,
	parameters,
	argTypes,
	args,
} satisfies Meta<typeof BaseDashboardGrid>

export default meta

export const Default = cases.Default
export const Editable = cases.Editable
export const SmallGap = cases.SmallGap
export const AutoScroll = cases.AutoScroll
export const StaticItems = cases.StaticItems
export const Responsive = cases.Responsive
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const CustomColor = cases.CustomColor
export const Disabled = cases.Disabled
export const Empty = cases.Empty
export const LongContent = cases.LongContent
export const Keyboard = cases.Keyboard
export const Theming = cases.Theming
export const Animations = cases.Animations
