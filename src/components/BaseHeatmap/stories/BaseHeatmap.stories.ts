import { args } from './args'
import * as cases from './cases'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import BaseHeatmap from '../ui/BaseHeatmap.vue'
import type { Meta } from '@storybook/vue3-vite'

const meta = {
	title: 'Data/BaseHeatmap',
	component: BaseHeatmap,
	parameters,
	argTypes,
	args,
} satisfies Meta<typeof BaseHeatmap>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
