import { args } from './args'
import * as cases from './cases'
import { argTypes } from './argTypes'
import BaseText from '../ui/BaseText.vue'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'

const meta = {
	title: 'Element/BaseText',
	component: BaseText,
	parameters,
	argTypes,
	args,
} satisfies Meta<typeof BaseText>

export default meta

export const Default = cases.Default
export const Sizes = cases.Sizes
export const Weights = cases.Weights
export const CustomColor = cases.CustomColor
export const Tags = cases.Tags
export const LongContent = cases.LongContent
export const Truncate = cases.Truncate
export const MaxLines = cases.MaxLines
export const Nowrap = cases.Nowrap
export const Hierarchy = cases.Hierarchy
