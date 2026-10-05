import { args } from './args'
import * as cases from './cases'
import { render } from './render'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BaseDropdownMenu from '../ui/BaseDropdownMenu.vue'

const meta = {
	title: 'Overlay/BaseDropdownMenu',
	component: BaseDropdownMenu,
	parameters,
	argTypes,
	args,
	render,
} satisfies Meta<typeof BaseDropdownMenu>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const CustomColor = cases.CustomColor
export const Disabled = cases.Disabled
export const LongContent = cases.LongContent
export const CheckboxesAndRadios = cases.CheckboxesAndRadios
export const Submenu = cases.Submenu
export const Keyboard = cases.Keyboard
export const Theming = cases.Theming
export const Animations = cases.Animations
