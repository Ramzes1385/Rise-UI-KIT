import { args } from './args'
import * as cases from './cases'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import BaseGantt from '../ui/BaseGantt.vue'
import type { Meta } from '@storybook/vue3-vite'

const meta = {
	title: 'Data/BaseGantt',
	component: BaseGantt,
	parameters,
	argTypes,
	args,
} satisfies Meta<typeof BaseGantt>

export default meta

export const Default = cases.Default
export const Scales = cases.Scales
export const Dependencies = cases.Dependencies
export const Milestones = cases.Milestones
export const Editable = cases.Editable
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const CustomColor = cases.CustomColor
export const Disabled = cases.Disabled
export const Loading = cases.Loading
export const Empty = cases.Empty
export const LongContent = cases.LongContent
export const Keyboard = cases.Keyboard
export const Theming = cases.Theming
export const Animations = cases.Animations
