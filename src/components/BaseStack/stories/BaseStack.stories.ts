import { args } from './args'
import * as cases from './cases'
import { render } from './render'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import BaseStack from '../ui/BaseStack.vue'
import type { Meta } from '@storybook/vue3-vite'

const meta = {
	title: 'Layout/BaseStack',
	component: BaseStack,
	parameters,
	argTypes,
	args,
	render,
} satisfies Meta<typeof BaseStack>

export default meta

export const Default = cases.Default
export const Directions = cases.Directions
export const Gaps = cases.Gaps
export const Align = cases.Align
export const Justify = cases.Justify
export const Wrap = cases.Wrap
export const Sizes = cases.Sizes
export const Theming = cases.Theming
export const Animations = cases.Animations
