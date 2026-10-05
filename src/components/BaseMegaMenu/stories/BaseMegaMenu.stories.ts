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
export const WithEnd = cases.WithEnd
export const CustomLink = cases.CustomLink
export const HoverTrigger = cases.HoverTrigger
export const ClickTrigger = cases.ClickTrigger
export const Mobile = cases.Mobile
export const Keyboard = cases.Keyboard
export const Cascade = cases.Cascade
export const Theming = cases.Theming
export const Animations = cases.Animations
