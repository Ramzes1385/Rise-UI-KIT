import { args } from './args'
import * as cases from './cases'
import { render } from './render'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import BaseInput from '../ui/BaseInput.vue'
import type { Meta } from '@storybook/vue3-vite'

const meta = {
	title: 'Form/BaseInput',
	component: BaseInput,
	parameters,
	argTypes,
	args,
	render,
} satisfies Meta<typeof BaseInput>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const CustomColor = cases.CustomColor
export const Theming = cases.Theming
export const Empty = cases.Empty
export const WithError = cases.WithError
export const Disabled = cases.Disabled
export const Readonly = cases.Readonly
export const LongContent = cases.LongContent
export const PrefixPostfix = cases.PrefixPostfix
export const Search = cases.Search
export const WithSlots = cases.WithSlots
export const Password = cases.Password
export const PasswordRules = cases.PasswordRules
export const Mask = cases.Mask
export const AllowedChars = cases.AllowedChars
export const Keyboard = cases.Keyboard
export const Animations = cases.Animations
