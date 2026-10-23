import { args } from './args'
import * as cases from './cases'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BaseRequisiteInput from '../ui/BaseRequisiteInput.vue'

const meta = {
	title: 'Form/BaseRequisiteInput',
	component: BaseRequisiteInput,
	parameters,
	argTypes,
	args,
} satisfies Meta<typeof BaseRequisiteInput>

export default meta

export const Default = cases.Default
export const Company = cases.Company
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const CustomColor = cases.CustomColor
export const Disabled = cases.Disabled
export const WithError = cases.WithError
export const Theming = cases.Theming
export const Animations = cases.Animations
