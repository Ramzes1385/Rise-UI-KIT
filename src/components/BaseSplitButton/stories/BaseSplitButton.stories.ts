import { args } from './args'
import * as cases from './cases'
import { render } from './render'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BaseSplitButton from '../ui/BaseSplitButton.vue'

const meta = {
	title: 'Element/BaseSplitButton',
	component: BaseSplitButton,
	parameters,
	argTypes,
	args,
	render,
} satisfies Meta<typeof BaseSplitButton>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const Disabled = cases.Disabled
export const Loading = cases.Loading
export const Keyboard = cases.Keyboard
export const Theming = cases.Theming
export const Animations = cases.Animations
