import { args } from './args'
import * as cases from './cases'
import { render } from './render'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import BaseSelect from '../ui/BaseSelect.vue'
import type { Meta } from '@storybook/vue3-vite'

const meta = {
	title: 'Form/BaseSelect',
	component: BaseSelect,
	parameters,
	argTypes,
	args,
	render,
} satisfies Meta<typeof BaseSelect>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const CustomColor = cases.CustomColor
export const Theming = cases.Theming
export const Empty = cases.Empty
export const WithError = cases.WithError
export const Disabled = cases.Disabled
export const LongContent = cases.LongContent
export const WithIcons = cases.WithIcons
export const Slots = cases.Slots
export const Multiple = cases.Multiple
export const Searchable = cases.Searchable
export const DisabledOptions = cases.DisabledOptions
export const Keyboard = cases.Keyboard
export const AriaLabel = cases.AriaLabel
export const Animations = cases.Animations
