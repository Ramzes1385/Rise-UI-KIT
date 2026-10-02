import { args } from './args'
import * as cases from './cases'
import { render } from './render'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BaseSlideover from '../ui/BaseSlideover.vue'

const meta = {
	title: 'Overlay/BaseSlideover',
	component: BaseSlideover,
	parameters,
	argTypes,
	args,
	render,
} satisfies Meta<typeof BaseSlideover>

export default meta

export const Default = cases.Default
export const Sides = cases.Sides
export const Widths = cases.Widths
export const Sizes = cases.Sizes
export const CustomColor = cases.CustomColor
export const LongContent = cases.LongContent
export const Contained = cases.Contained
export const Padding = cases.Padding
export const Keyboard = cases.Keyboard
export const NonModal = cases.NonModal
