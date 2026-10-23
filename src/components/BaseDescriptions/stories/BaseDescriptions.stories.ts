import { args } from './args'
import * as cases from './cases'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BaseDescriptions from '../ui/BaseDescriptions.vue'

const meta = {
	title: 'Data/BaseDescriptions',
	component: BaseDescriptions,
	parameters,
	argTypes,
	args,
} satisfies Meta<typeof BaseDescriptions>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const CustomColor = cases.CustomColor
export const Layouts = cases.Layouts
export const Responsive = cases.Responsive
export const Copyable = cases.Copyable
export const CustomSlots = cases.CustomSlots
export const Empty = cases.Empty
export const LongContent = cases.LongContent
export const Theming = cases.Theming
export const Animations = cases.Animations
