import { args } from './args'
import * as cases from './cases'
import { render } from './render'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import BaseToolbar from '../ui/BaseToolbar.vue'
import type { Meta } from '@storybook/vue3-vite'

const meta = {
	title: 'Navigation/BaseToolbar',
	component: BaseToolbar,
	parameters,
	argTypes,
	args,
	render,
} satisfies Meta<typeof BaseToolbar>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const Vertical = cases.Vertical
export const Disabled = cases.Disabled
export const WithFieldAndMenu = cases.WithFieldAndMenu
export const Keyboard = cases.Keyboard
