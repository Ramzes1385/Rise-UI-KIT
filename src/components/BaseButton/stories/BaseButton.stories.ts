import { args } from './args'
import * as cases from './cases'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import BaseButton from '../ui/BaseButton.vue'
import type { Meta } from '@storybook/vue3-vite'

const meta = {
	title: 'Element/BaseButton',
	component: BaseButton,
	parameters,
	argTypes,
	args,
} satisfies Meta<typeof BaseButton>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const CustomColor = cases.CustomColor
export const Disabled = cases.Disabled
export const Loading = cases.Loading
export const WithIcons = cases.WithIcons
export const LongText = cases.LongText
export const InForm = cases.InForm
export const Padding = cases.Padding
export const Keyboard = cases.Keyboard
