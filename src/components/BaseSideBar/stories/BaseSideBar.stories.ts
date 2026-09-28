import { args } from './args'
import * as cases from './cases'
import { render } from './render'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import BaseSideBar from '../ui/BaseSideBar.vue'
import type { Meta } from '@storybook/vue3-vite'

const meta = {
	title: 'Navigation/BaseSideBar',
	component: BaseSideBar,
	parameters,
	argTypes,
	args,
	render,
} satisfies Meta<typeof BaseSideBar>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const Collapsed = cases.Collapsed
export const CustomColor = cases.CustomColor
export const Loading = cases.Loading
export const LongContent = cases.LongContent
export const NotCollapsible = cases.NotCollapsible
export const WithSlots = cases.WithSlots
export const NavigationSlot = cases.NavigationSlot
export const CustomItemSlot = cases.CustomItemSlot
export const ActiveByKey = cases.ActiveByKey
export const ItemActions = cases.ItemActions
export const AppLayout = cases.AppLayout
export const Controlled = cases.Controlled
export const Keyboard = cases.Keyboard
