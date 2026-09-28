import { args } from './args'
import * as cases from './cases'
import { render } from './render'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BaseSplitter from '../ui/BaseSplitter.vue'

const meta = {
	title: 'Layout/BaseSplitter',
	component: BaseSplitter,
	parameters,
	argTypes,
	args,
	render,
} satisfies Meta<typeof BaseSplitter>

export default meta

export const Default = cases.Default
export const Vertical = cases.Vertical
export const Variants = cases.Variants
export const Disabled = cases.Disabled
export const Keyboard = cases.Keyboard
