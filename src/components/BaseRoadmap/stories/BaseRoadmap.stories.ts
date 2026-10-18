import { args } from './args'
import * as cases from './cases'
import { render } from './render'
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
	render,
} satisfies Meta<typeof BaseRoadmap>

export default meta

export const Default = cases.Default
export const Layouts = cases.Layouts
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const CustomColor = cases.CustomColor
export const Disabled = cases.Disabled
export const Loading = cases.Loading
export const Empty = cases.Empty
export const LongContent = cases.LongContent
export const LayoutSnake = cases.LayoutSnake
export const LayoutList = cases.LayoutList
export const LayoutHorizontal = cases.LayoutHorizontal
