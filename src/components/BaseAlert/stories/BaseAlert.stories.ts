import { args } from './args'
import * as cases from './cases'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import BaseAlert from '../ui/BaseAlert.vue'
import type { Meta } from '@storybook/vue3-vite'

const meta = {
	title: 'Element/BaseAlert',
	component: BaseAlert,
	parameters,
	argTypes,
	args,
} satisfies Meta<typeof BaseAlert>

export default meta

export const Default = cases.Default
export const Types = cases.Types
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const CustomColor = cases.CustomColor
export const CustomIcon = cases.CustomIcon
export const WithActions = cases.WithActions
export const LongContent = cases.LongContent
export const Closable = cases.Closable
export const Keyboard = cases.Keyboard
export const Theming = cases.Theming
export const Animations = cases.Animations
