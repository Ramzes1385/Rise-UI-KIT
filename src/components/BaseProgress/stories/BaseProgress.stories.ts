import { args } from './args'
import * as cases from './cases'
import { argTypes } from './argTypes'
import { decorators } from './decorators'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BaseProgress from '../ui/BaseProgress.vue'

const meta = {
	title: 'Element/BaseProgress',
	component: BaseProgress,
	parameters,
	decorators,
	argTypes,
	args,
} satisfies Meta<typeof BaseProgress>

export default meta

export const Default = cases.Default
export const Sizes = cases.Sizes
export const Circle = cases.Circle
export const CustomColor = cases.CustomColor
export const Animations = cases.Animations
export const Fills = cases.Fills
export const Indeterminate = cases.Indeterminate
export const WithLabel = cases.WithLabel
export const Complete = cases.Complete
