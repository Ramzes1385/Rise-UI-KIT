import { args } from './args'
import * as cases from './cases'
import { render } from './render'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BaseSegmented from '../ui/BaseSegmented.vue'

const meta = {
	title: 'Form/BaseSegmented',
	component: BaseSegmented,
	parameters,
	argTypes,
	args,
	render,
} satisfies Meta<typeof BaseSegmented>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const Theming = cases.Theming
export const BlockWithIcons = cases.BlockWithIcons
export const Disabled = cases.Disabled
export const WithError = cases.WithError
export const Keyboard = cases.Keyboard
export const Animations = cases.Animations
