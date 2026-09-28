import { args } from './args'
import * as cases from './cases'
import { render } from './render'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BaseAutocomplete from '../ui/BaseAutocomplete.vue'

const meta = {
	title: 'Form/BaseAutocomplete',
	component: BaseAutocomplete,
	parameters,
	argTypes,
	args,
	render,
} satisfies Meta<typeof BaseAutocomplete>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const Disabled = cases.Disabled
export const WithError = cases.WithError
export const Empty = cases.Empty
export const CustomValue = cases.CustomValue
export const Remote = cases.Remote
export const Keyboard = cases.Keyboard
