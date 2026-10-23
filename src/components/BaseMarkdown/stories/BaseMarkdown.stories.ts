import { args } from './args'
import * as cases from './cases'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BaseMarkdown from '../ui/BaseMarkdown.vue'

const meta = {
	title: 'Element/BaseMarkdown',
	component: BaseMarkdown,
	parameters,
	argTypes,
	args,
} satisfies Meta<typeof BaseMarkdown>

export default meta

export const Default = cases.Default
export const Streaming = cases.Streaming
export const Safety = cases.Safety
export const CodeBlocks = cases.CodeBlocks
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const CustomColor = cases.CustomColor
export const Theming = cases.Theming
export const Animations = cases.Animations
