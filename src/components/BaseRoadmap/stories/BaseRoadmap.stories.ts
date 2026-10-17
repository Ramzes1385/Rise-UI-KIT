import { args } from './args'
import * as cases from './cases'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import BaseRoadmap from '../ui/BaseRoadmap.vue'
import type { Meta } from '@storybook/vue3-vite'

const meta = {
	title: 'Data/BaseRoadmap',
	component: BaseRoadmap,
	parameters,
	argTypes,
	args,
} satisfies Meta<typeof BaseRoadmap>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const CustomColor = cases.CustomColor
export const Disabled = cases.Disabled
export const Loading = cases.Loading
export const Empty = cases.Empty
export const LongContent = cases.LongContent
