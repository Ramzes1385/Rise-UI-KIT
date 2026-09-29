import { args } from './args'
import * as cases from './cases'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BaseAiMessage from '../ui/BaseAiMessage.vue'

const meta = {
	title: 'Chat/BaseAiMessage',
	component: BaseAiMessage,
	parameters,
	argTypes,
	args,
} satisfies Meta<typeof BaseAiMessage>

export default meta

export const Default = cases.Default
export const Streaming = cases.Streaming
export const WithError = cases.WithError
export const Composition = cases.Composition
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const CustomColor = cases.CustomColor
