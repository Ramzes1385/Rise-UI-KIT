import { args } from './args'
import * as cases from './cases'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BaseReasoning from '../ui/BaseReasoning.vue'

const meta = {
	title: 'Chat/BaseReasoning',
	component: BaseReasoning,
	parameters,
	argTypes,
	args,
} satisfies Meta<typeof BaseReasoning>

export default meta

export const Default = cases.Default
export const Streaming = cases.Streaming
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const CustomColor = cases.CustomColor
export const Theming = cases.Theming
export const Animations = cases.Animations
