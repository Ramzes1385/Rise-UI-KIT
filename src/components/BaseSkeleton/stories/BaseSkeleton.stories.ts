import { args } from './args'
import * as cases from './cases'
import { argTypes } from './argTypes'
import { decorators } from './decorators'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BaseSkeleton from '../ui/BaseSkeleton.vue'

const meta = {
	title: 'Element/BaseSkeleton',
	component: BaseSkeleton,
	parameters,
	decorators,
	argTypes,
	args,
} satisfies Meta<typeof BaseSkeleton>

export default meta

export const Default = cases.Default
export const Shapes = cases.Shapes
export const Animations = cases.Animations
export const Sizes = cases.Sizes
export const CustomColor = cases.CustomColor
export const CardPlaceholder = cases.CardPlaceholder
