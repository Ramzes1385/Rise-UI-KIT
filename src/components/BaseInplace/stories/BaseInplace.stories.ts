import { args } from './args'
import * as cases from './cases'
import { render } from './render'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import BaseInplace from '../ui/BaseInplace.vue'
import type { Meta } from '@storybook/vue3-vite'

const meta = {
	title: 'Form/BaseInplace',
	component: BaseInplace,
	parameters,
	argTypes,
	args,
	render,
} satisfies Meta<typeof BaseInplace>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const InHeading = cases.InHeading
export const Empty = cases.Empty
export const Disabled = cases.Disabled
export const CancelOnBlur = cases.CancelOnBlur
export const Keyboard = cases.Keyboard
