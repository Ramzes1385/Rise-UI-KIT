import { args } from './args'
import * as cases from './cases'
import { render } from './render'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import BaseDrawer from '../ui/BaseDrawer.vue'
import type { Meta } from '@storybook/vue3-vite'

const meta = {
	title: 'Overlay/BaseDrawer',
	component: BaseDrawer,
	parameters,
	argTypes,
	args,
	render,
} satisfies Meta<typeof BaseDrawer>

export default meta

export const Default = cases.Default
export const Directions = cases.Directions
export const Keyboard = cases.Keyboard
export const Theming = cases.Theming
export const Animations = cases.Animations
