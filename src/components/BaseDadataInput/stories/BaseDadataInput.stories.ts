import { args } from './args'
import * as cases from './cases'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BaseDadataInput from '../ui/BaseDadataInput.vue'

const meta = {
	title: 'Form/BaseDadataInput',
	component: BaseDadataInput,
	parameters,
	argTypes,
	args,
} satisfies Meta<typeof BaseDadataInput>

export default meta

export const Default = cases.Default
export const Kinds = cases.Kinds
export const WithRequisites = cases.WithRequisites
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const CustomColor = cases.CustomColor
export const Disabled = cases.Disabled
export const WithError = cases.WithError
export const Loading = cases.Loading
export const Empty = cases.Empty
export const LongContent = cases.LongContent
