import { args } from './args'
import * as cases from './cases'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BasePhoneInput from '../ui/BasePhoneInput.vue'

const meta = {
	title: 'Form/BasePhoneInput',
	component: BasePhoneInput,
	parameters,
	argTypes,
	args,
} satisfies Meta<typeof BasePhoneInput>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const CustomColor = cases.CustomColor
export const Disabled = cases.Disabled
export const WithError = cases.WithError
