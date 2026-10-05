import { args } from './args'
import * as cases from './cases'
import { render } from './render'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BaseInputTags from '../ui/BaseInputTags.vue'

const meta = {
	title: 'Form/BaseInputTags',
	component: BaseInputTags,
	parameters,
	argTypes,
	args,
	render,
} satisfies Meta<typeof BaseInputTags>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const Theming = cases.Theming
export const Disabled = cases.Disabled
export const WithError = cases.WithError
export const LongContent = cases.LongContent
export const Validation = cases.Validation
export const Keyboard = cases.Keyboard
export const Animations = cases.Animations
