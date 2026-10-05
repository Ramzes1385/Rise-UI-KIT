import { args } from './args'
import * as cases from './cases'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BaseSparkline from '../ui/BaseSparkline.vue'

const meta = {
	title: 'Data/BaseSparkline',
	component: BaseSparkline,
	parameters,
	argTypes,
	args,
} satisfies Meta<typeof BaseSparkline>

export default meta

export const Default = cases.Default
export const StatTiles = cases.StatTiles
export const Variants = cases.Variants
export const Theming = cases.Theming
export const Animations = cases.Animations
