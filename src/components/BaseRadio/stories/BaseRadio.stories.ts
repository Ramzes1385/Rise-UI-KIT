import { args } from './args'
import * as cases from './cases'
import { render } from './render'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import BaseRadio from '../ui/BaseRadio.vue'
import type { Meta } from '@storybook/vue3-vite'

const meta = {
	title: 'Form/BaseRadio',
	component: BaseRadio,
	parameters,
	argTypes,
	args,
	render,
} satisfies Meta<typeof BaseRadio>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const CustomColor = cases.CustomColor
export const Theming = cases.Theming
export const Vertical = cases.Vertical
export const Disabled = cases.Disabled
export const WithError = cases.WithError
export const LongContent = cases.LongContent
export const OptionSlot = cases.OptionSlot
export const Keyboard = cases.Keyboard
export const Animations = cases.Animations
