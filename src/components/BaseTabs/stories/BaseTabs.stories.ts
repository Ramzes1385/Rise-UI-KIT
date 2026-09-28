import { args } from './args'
import * as cases from './cases'
import { render } from './render'
import { argTypes } from './argTypes'
import BaseTabs from '../ui/BaseTabs.vue'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'

const meta = {
	title: 'Navigation/BaseTabs',
	component: BaseTabs,
	parameters,
	argTypes,
	args,
	render,
} satisfies Meta<typeof BaseTabs>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const FullWidth = cases.FullWidth
export const CustomColor = cases.CustomColor
export const Disabled = cases.Disabled
export const Empty = cases.Empty
export const LongContent = cases.LongContent
export const WithIcons = cases.WithIcons
export const WithContent = cases.WithContent
export const Scrollable = cases.Scrollable
export const Keyboard = cases.Keyboard
