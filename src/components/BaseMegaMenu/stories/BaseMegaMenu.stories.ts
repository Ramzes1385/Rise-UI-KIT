import { args } from './args'
import * as cases from './cases'
import { render } from './render'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BaseMegaMenu from '../ui/BaseMegaMenu.vue'

const meta = {
	title: 'Navigation/BaseMegaMenu',
	component: BaseMegaMenu,
	parameters,
	argTypes,
	args,
	render,
} satisfies Meta<typeof BaseMegaMenu>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const CustomColor = cases.CustomColor
export const Disabled = cases.Disabled
export const Empty = cases.Empty
export const LongContent = cases.LongContent
export const Dropdown = cases.Dropdown
export const HoverTrigger = cases.HoverTrigger
export const DeepNesting = cases.DeepNesting
export const Keyboard = cases.Keyboard
