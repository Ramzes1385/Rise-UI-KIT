import { args } from './args'
import * as cases from './cases'
import { render } from './render'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BaseTimeline from '../ui/BaseTimeline.vue'

const meta = {
	title: 'Data/BaseTimeline',
	component: BaseTimeline,
	parameters,
	argTypes,
	args,
	render,
} satisfies Meta<typeof BaseTimeline>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const Horizontal = cases.Horizontal
export const CustomItem = cases.CustomItem
export const Chronology = cases.Chronology
