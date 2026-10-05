import { args } from './args'
import * as cases from './cases'
import { argTypes } from './argTypes'
import BaseTag from '../ui/BaseTag.vue'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'

const meta = {
	title: 'Element/BaseTag',
	component: BaseTag,
	parameters,
	argTypes,
	args,
} satisfies Meta<typeof BaseTag>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const Tones = cases.Tones
export const Sizes = cases.Sizes
export const CustomColor = cases.CustomColor
export const Theming = cases.Theming
export const WithIcon = cases.WithIcon
export const LongContent = cases.LongContent
export const Removable = cases.Removable
export const Clickable = cases.Clickable
export const Disabled = cases.Disabled
export const Animations = cases.Animations
