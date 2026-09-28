import { args } from './args'
import * as cases from './cases'
import { render } from './render'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import BaseTooltip from '../ui/BaseTooltip.vue'
import type { Meta } from '@storybook/vue3-vite'

const meta = {
	title: 'Overlay/BaseTooltip',
	component: BaseTooltip,
	parameters,
	argTypes,
	args,
	render,
} satisfies Meta<typeof BaseTooltip>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const Positions = cases.Positions
export const Sizes = cases.Sizes
export const CustomColor = cases.CustomColor
export const LongContent = cases.LongContent
export const Keyboard = cases.Keyboard
