import { args } from './args'
import * as cases from './cases'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BasePromptInput from '../ui/BasePromptInput.vue'

const meta = {
	title: 'Chat/BasePromptInput',
	component: BasePromptInput,
	parameters,
	argTypes,
	args,
} satisfies Meta<typeof BasePromptInput>

export default meta

export const Default = cases.Default
export const Generating = cases.Generating
export const WithToolbar = cases.WithToolbar
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const CustomColor = cases.CustomColor
export const Disabled = cases.Disabled
export const WithError = cases.WithError
