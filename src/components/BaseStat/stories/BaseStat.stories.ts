import { args } from './args'
import * as cases from './cases'
import { argTypes } from './argTypes'
import BaseStat from '../ui/BaseStat.vue'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'

const meta = {
	title: 'Data/BaseStat',
	component: BaseStat,
	parameters,
	argTypes,
	args,
} satisfies Meta<typeof BaseStat>

export default meta

export const Default = cases.Default
export const Trends = cases.Trends
export const WithSparkline = cases.WithSparkline
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const Loading = cases.Loading
export const LongContent = cases.LongContent
export const CustomColor = cases.CustomColor
