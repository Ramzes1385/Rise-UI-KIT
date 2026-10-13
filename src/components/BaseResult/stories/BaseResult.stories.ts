import { args } from './args'
import * as cases from './cases'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import BaseResult from '../ui/BaseResult.vue'
import type { Meta } from '@storybook/vue3-vite'

const meta = {
	title: 'Data/BaseResult',
	component: BaseResult,
	parameters,
	argTypes,
	args,
} satisfies Meta<typeof BaseResult>

export default meta

export const Default = cases.Default
export const Statuses = cases.Statuses
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const CustomColor = cases.CustomColor
export const WithDetails = cases.WithDetails
export const Actions = cases.Actions
export const LongContent = cases.LongContent
export const Keyboard = cases.Keyboard
export const Theming = cases.Theming
