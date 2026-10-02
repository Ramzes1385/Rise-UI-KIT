import { args } from './args'
import * as cases from './cases'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import BaseChart from '../ui/BaseChart.vue'
import type { Meta } from '@storybook/vue3-vite'

const meta = {
	title: 'Data/BaseChart',
	component: BaseChart,
	parameters,
	argTypes,
	args,
} satisfies Meta<typeof BaseChart>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const Empty = cases.Empty
