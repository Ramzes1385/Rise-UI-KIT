import { args } from './args'
import * as cases from './cases'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BaseFilterBuilder from '../ui/BaseFilterBuilder.vue'

const meta = {
	title: 'Data/BaseFilterBuilder',
	component: BaseFilterBuilder,
	parameters,
	argTypes,
	args,
} satisfies Meta<typeof BaseFilterBuilder>

export default meta

export const Default = cases.Default
export const WithKanban = cases.WithKanban
export const Empty = cases.Empty
export const Disabled = cases.Disabled
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const CustomColor = cases.CustomColor
