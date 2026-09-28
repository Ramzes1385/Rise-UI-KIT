import { args } from './args'
import * as cases from './cases'
import { render } from './render'
import { argTypes } from './argTypes'
import BasePin from '../ui/BasePin.vue'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'

const meta = {
	title: 'Form/BasePin',
	component: BasePin,
	parameters,
	argTypes,
	args,
	render,
} satisfies Meta<typeof BasePin>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const CustomColor = cases.CustomColor
export const Empty = cases.Empty
export const WithError = cases.WithError
export const Disabled = cases.Disabled
export const Password = cases.Password
export const Paste = cases.Paste
export const Keyboard = cases.Keyboard
