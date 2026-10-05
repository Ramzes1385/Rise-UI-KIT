import { args } from './args'
import * as cases from './cases'
import { render } from './render'
import { argTypes } from './argTypes'
import BaseMenu from '../ui/BaseMenu.vue'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'

const meta = {
	title: 'Navigation/BaseMenu',
	component: BaseMenu,
	parameters,
	argTypes,
	args,
	render,
} satisfies Meta<typeof BaseMenu>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const CustomColor = cases.CustomColor
export const Disabled = cases.Disabled
export const Empty = cases.Empty
export const LongContent = cases.LongContent
export const WithDividers = cases.WithDividers
export const ItemClickHandler = cases.ItemClickHandler
export const Keyboard = cases.Keyboard
export const Links = cases.Links
export const Theming = cases.Theming
export const Animations = cases.Animations
