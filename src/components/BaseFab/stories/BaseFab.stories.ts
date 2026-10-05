import { args } from './args'
import * as cases from './cases'
import { render } from './render'
import { argTypes } from './argTypes'
import BaseFab from '../ui/BaseFab.vue'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'

const meta = {
	title: 'Element/BaseFab',
	component: BaseFab,
	parameters,
	argTypes,
	args,
	render,
} satisfies Meta<typeof BaseFab>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const Extended = cases.Extended
export const Sizes = cases.Sizes
export const Disabled = cases.Disabled
export const Link = cases.Link
export const Keyboard = cases.Keyboard
export const Theming = cases.Theming
export const Animations = cases.Animations
