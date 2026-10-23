import { args } from './args'
import * as cases from './cases'
import { render } from './render'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BasePopconfirm from '../ui/BasePopconfirm.vue'

const meta = {
	title: 'Overlay/BasePopconfirm',
	component: BasePopconfirm,
	parameters,
	argTypes,
	args,
	render,
} satisfies Meta<typeof BasePopconfirm>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const Positions = cases.Positions
export const ArrowAtEdge = cases.ArrowAtEdge
export const Sizes = cases.Sizes
export const Danger = cases.Danger
export const LongContent = cases.LongContent
export const Keyboard = cases.Keyboard
export const Theming = cases.Theming
export const Animations = cases.Animations
