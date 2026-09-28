import { args } from './args'
import * as cases from './cases'
import { render } from './render'
import { argTypes } from './argTypes'
import BaseChip from '../ui/BaseChip.vue'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'

const meta = {
	title: 'Element/BaseChip',
	component: BaseChip,
	parameters,
	argTypes,
	args,
	render,
} satisfies Meta<typeof BaseChip>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const Placements = cases.Placements
export const CustomColor = cases.CustomColor
export const Overflow = cases.Overflow
export const HiddenOnZero = cases.HiddenOnZero
export const LongContent = cases.LongContent
export const Counter = cases.Counter
