import { args } from './args'
import * as cases from './cases'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BaseTextDiff from '../ui/BaseTextDiff.vue'

const meta = {
	title: 'Data/BaseTextDiff',
	component: BaseTextDiff,
	parameters,
	argTypes,
	args,
} satisfies Meta<typeof BaseTextDiff>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const CustomColor = cases.CustomColor
export const Split = cases.Split
export const NoChanges = cases.NoChanges
