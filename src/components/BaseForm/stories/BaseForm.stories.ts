import { args } from './args'
import * as cases from './cases'
import { render } from './render'
import { argTypes } from './argTypes'
import BaseForm from '../ui/BaseForm.vue'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'

const meta = {
	title: 'Form/BaseForm',
	component: BaseForm,
	parameters,
	argTypes,
	args,
	render,
} satisfies Meta<typeof BaseForm>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const Loading = cases.Loading
export const Disabled = cases.Disabled
export const Validation = cases.Validation
export const Schema = cases.Schema
export const SubmitWithLoading = cases.SubmitWithLoading
export const Keyboard = cases.Keyboard
