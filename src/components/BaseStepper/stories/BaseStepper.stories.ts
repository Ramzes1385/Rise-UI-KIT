import { args } from './args'
import * as cases from './cases'
import { render } from './render'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import BaseStepper from '../ui/BaseStepper.vue'
import type { Meta } from '@storybook/vue3-vite'

const meta = {
	title: 'Navigation/BaseStepper',
	component: BaseStepper,
	parameters,
	argTypes,
	args,
	render,
} satisfies Meta<typeof BaseStepper>

export default meta

export const Default = cases.Default
export const Shapes = cases.Shapes
export const Vertical = cases.Vertical
export const Sizes = cases.Sizes
export const Narrow = cases.Narrow
export const CustomColor = cases.CustomColor
export const Disabled = cases.Disabled
export const Errors = cases.Errors
export const LongContent = cases.LongContent
export const WithIcons = cases.WithIcons
export const CustomItem = cases.CustomItem
export const Wizard = cases.Wizard
export const Clickable = cases.Clickable
export const Keyboard = cases.Keyboard
export const Theming = cases.Theming
export const Animations = cases.Animations
