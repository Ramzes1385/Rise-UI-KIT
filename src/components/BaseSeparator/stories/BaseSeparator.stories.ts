import { args } from './args'
import * as cases from './cases'
import { argTypes } from './argTypes'
import { decorators } from './decorators'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BaseSeparator from '../ui/BaseSeparator.vue'

const meta = {
	title: 'Element/BaseSeparator',
	component: BaseSeparator,
	parameters,
	decorators,
	argTypes,
	args,
} satisfies Meta<typeof BaseSeparator>

export default meta

export const Default = cases.Default
export const WithLabel = cases.WithLabel
export const Vertical = cases.Vertical
export const Dashed = cases.Dashed
export const Thickness = cases.Thickness
export const CustomColor = cases.CustomColor
export const WithSlot = cases.WithSlot
export const Spacing = cases.Spacing
export const Theming = cases.Theming
export const Animations = cases.Animations
