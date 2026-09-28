import { args } from './args'
import * as cases from './cases'
import { render } from './render'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BaseTimePicker from '../ui/BaseTimePicker.vue'

const meta = {
	title: 'Form/BaseTimePicker',
	component: BaseTimePicker,
	parameters,
	argTypes,
	args,
	render,
} satisfies Meta<typeof BaseTimePicker>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const Disabled = cases.Disabled
export const WithError = cases.WithError
export const TypedTime = cases.TypedTime
export const Keyboard = cases.Keyboard
