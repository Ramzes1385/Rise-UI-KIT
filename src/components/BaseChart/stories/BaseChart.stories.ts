import { args } from './args'
import * as cases from './cases'
import { render } from './render'
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
	render,
} satisfies Meta<typeof BaseChart>

export default meta

export const Default = cases.Default
export const Line = cases.Line
export const Area = cases.Area
export const Bars = cases.Bars
export const Stacked = cases.Stacked
export const MultiSeries = cases.MultiSeries
export const Sizes = cases.Sizes
export const Empty = cases.Empty
export const WithGaps = cases.WithGaps
export const Formats = cases.Formats
export const CustomTooltip = cases.CustomTooltip
export const Dense = cases.Dense
export const HiddenSeries = cases.HiddenSeries
export const Keyboard = cases.Keyboard
export const Animations = cases.Animations
