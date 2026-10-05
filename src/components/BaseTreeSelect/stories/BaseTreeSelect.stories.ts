import { args } from './args'
import * as cases from './cases'
import { render } from './render'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BaseTreeSelect from '../ui/BaseTreeSelect.vue'

const meta = {
	title: 'Form/BaseTreeSelect',
	component: BaseTreeSelect,
	parameters,
	argTypes,
	args,
	render,
} satisfies Meta<typeof BaseTreeSelect>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const CustomColor = cases.CustomColor
export const Theming = cases.Theming
export const Disabled = cases.Disabled
export const WithError = cases.WithError
export const Loading = cases.Loading
export const Empty = cases.Empty
export const LongContent = cases.LongContent
export const Keyboard = cases.Keyboard
export const Multiple = cases.Multiple
export const Searchable = cases.Searchable
export const Animations = cases.Animations
