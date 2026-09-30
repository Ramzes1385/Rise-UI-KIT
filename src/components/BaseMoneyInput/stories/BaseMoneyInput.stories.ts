import { args } from './args'
import * as cases from './cases'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BaseMoneyInput from '../ui/BaseMoneyInput.vue'

const meta = {
	title: 'Form/BaseMoneyInput',
	component: BaseMoneyInput,
	parameters,
	argTypes,
	args,
} satisfies Meta<typeof BaseMoneyInput>

export default meta

export const Default = cases.Default
export const Currencies = cases.Currencies
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const CustomColor = cases.CustomColor
export const Disabled = cases.Disabled
export const WithError = cases.WithError
