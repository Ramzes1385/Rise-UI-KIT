import { args } from './args'
import * as cases from './cases'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BaseFormWizard from '../ui/BaseFormWizard.vue'

const meta = {
	title: 'Form/BaseFormWizard',
	component: BaseFormWizard,
	parameters,
	argTypes,
	args,
} satisfies Meta<typeof BaseFormWizard>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const CustomColor = cases.CustomColor
export const Disabled = cases.Disabled
export const Loading = cases.Loading
export const WithError = cases.WithError
export const Empty = cases.Empty
export const LongContent = cases.LongContent
export const Linear = cases.Linear
export const Validation = cases.Validation
export const OptionalSteps = cases.OptionalSteps
export const AsyncFinish = cases.AsyncFinish
export const Keyboard = cases.Keyboard
export const Theming = cases.Theming
export const Animations = cases.Animations
