import { args } from './args'
import * as cases from './cases'
import { render } from './render'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BaseCascader from '../ui/BaseCascader.vue'

const meta = {
	title: 'Form/BaseCascader',
	component: BaseCascader,
	parameters,
	argTypes,
	args,
	render,
} satisfies Meta<typeof BaseCascader>

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
export const LazyLevels = cases.LazyLevels
export const Searchable = cases.Searchable
export const Multiple = cases.Multiple
export const AnyLevel = cases.AnyLevel
export const Keyboard = cases.Keyboard
export const Animations = cases.Animations
