import { args } from './args'
import * as cases from './cases'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import BaseMention from '../ui/BaseMention.vue'
import type { Meta } from '@storybook/vue3-vite'

const meta = {
	title: 'Form/BaseMention',
	component: BaseMention,
	parameters,
	argTypes,
	args,
} satisfies Meta<typeof BaseMention>

export default meta

export const Default = cases.Default
export const CustomTrigger = cases.CustomTrigger
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const CustomColor = cases.CustomColor
export const Disabled = cases.Disabled
export const WithError = cases.WithError
