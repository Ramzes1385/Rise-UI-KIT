import { args } from './args'
import * as cases from './cases'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BaseImageCompare from '../ui/BaseImageCompare.vue'

const meta = {
	title: 'Media/BaseImageCompare',
	component: BaseImageCompare,
	parameters,
	argTypes,
	args,
} satisfies Meta<typeof BaseImageCompare>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const Theming = cases.Theming
export const Animations = cases.Animations
