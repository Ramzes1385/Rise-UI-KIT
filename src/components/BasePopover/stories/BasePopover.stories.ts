import { args } from './args'
import * as cases from './cases'
import { render } from './render'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import BasePopover from '../ui/BasePopover.vue'
import type { Meta } from '@storybook/vue3-vite'

const meta = {
	title: 'Overlay/BasePopover',
	component: BasePopover,
	parameters,
	argTypes,
	args,
	render,
} satisfies Meta<typeof BasePopover>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const Positions = cases.Positions
export const Sizes = cases.Sizes
export const CustomColor = cases.CustomColor
export const LongContent = cases.LongContent
export const WithForm = cases.WithForm
export const NestedList = cases.NestedList
export const Keyboard = cases.Keyboard
