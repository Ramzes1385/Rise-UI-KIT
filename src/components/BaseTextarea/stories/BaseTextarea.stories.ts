import { args } from './args'
import * as cases from './cases'
import { render } from './render'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BaseTextarea from '../ui/BaseTextarea.vue'

const meta = {
	title: 'Form/BaseTextarea',
	component: BaseTextarea,
	parameters,
	argTypes,
	args,
	render,
} satisfies Meta<typeof BaseTextarea>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const CustomColor = cases.CustomColor
export const Empty = cases.Empty
export const WithError = cases.WithError
export const Disabled = cases.Disabled
export const Readonly = cases.Readonly
export const LongContent = cases.LongContent
export const Rows = cases.Rows
export const Autosize = cases.Autosize
export const Maxlength = cases.Maxlength
export const Keyboard = cases.Keyboard
