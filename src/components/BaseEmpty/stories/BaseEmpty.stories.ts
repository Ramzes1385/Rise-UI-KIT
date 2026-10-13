import { args } from './args'
import * as cases from './cases'
import { render } from './render'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import BaseEmpty from '../ui/BaseEmpty.vue'
import type { Meta } from '@storybook/vue3-vite'

const meta = {
	title: 'Data/BaseEmpty',
	component: BaseEmpty,
	parameters,
	argTypes,
	args,
	render,
} satisfies Meta<typeof BaseEmpty>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const Compact = cases.Compact
export const Sizes = cases.Sizes
export const CustomColor = cases.CustomColor
export const Slots = cases.Slots
export const InCard = cases.InCard
export const NoResults = cases.NoResults
export const Theming = cases.Theming
export const Animations = cases.Animations
