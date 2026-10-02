import { args } from './args'
import * as cases from './cases'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BaseCryptoProSign from '../ui/BaseCryptoProSign.vue'

const meta = {
	title: 'Form/BaseCryptoProSign',
	component: BaseCryptoProSign,
	parameters,
	argTypes,
	args,
} satisfies Meta<typeof BaseCryptoProSign>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const CustomColor = cases.CustomColor
export const Disabled = cases.Disabled
export const Loading = cases.Loading
export const Empty = cases.Empty
