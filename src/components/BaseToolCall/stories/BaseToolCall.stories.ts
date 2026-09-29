import { args } from './args'
import * as cases from './cases'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BaseToolCall from '../ui/BaseToolCall.vue'

const meta = {
	title: 'Chat/BaseToolCall',
	component: BaseToolCall,
	parameters,
	argTypes,
	args,
} satisfies Meta<typeof BaseToolCall>

export default meta

export const Default = cases.Default
export const Statuses = cases.Statuses
export const WithError = cases.WithError
export const CustomResult = cases.CustomResult
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const CustomColor = cases.CustomColor
