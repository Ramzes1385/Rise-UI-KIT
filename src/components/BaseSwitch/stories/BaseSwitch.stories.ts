import { args } from './args'
import * as cases from './cases'
import { render } from './render'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import BaseSwitch from '../ui/BaseSwitch.vue'
import type { Meta } from '@storybook/vue3-vite'

const meta = {
	title: 'Form/BaseSwitch',
	component: BaseSwitch,
	parameters,
	argTypes,
	args,
	render,
} satisfies Meta<typeof BaseSwitch>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const CustomColor = cases.CustomColor
export const Theming = cases.Theming
export const Disabled = cases.Disabled
export const WithError = cases.WithError
export const LongContent = cases.LongContent
export const Reverse = cases.Reverse
export const Slots = cases.Slots
export const Keyboard = cases.Keyboard
export const Animations = cases.Animations
