import { args } from './args'
import * as cases from './cases'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BasePieChart from '../ui/BasePieChart.vue'

const meta = {
	title: 'Data/BasePieChart',
	component: BasePieChart,
	parameters,
	argTypes,
	args,
} satisfies Meta<typeof BasePieChart>

export default meta

export const Default = cases.Default
export const Animations = cases.Animations
export const Other = cases.Other
export const Variants = cases.Variants
export const Theming = cases.Theming
