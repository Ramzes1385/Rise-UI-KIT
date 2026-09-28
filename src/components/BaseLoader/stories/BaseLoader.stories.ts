import { args } from './args'
import * as cases from './cases'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import BaseLoader from '../ui/BaseLoader.vue'
import type { Meta } from '@storybook/vue3-vite'

const meta = {
	title: 'Element/BaseLoader',
	component: BaseLoader,
	parameters,
	argTypes,
	args,
} satisfies Meta<typeof BaseLoader>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const CustomColor = cases.CustomColor
export const WithLabel = cases.WithLabel
export const Overlay = cases.Overlay
