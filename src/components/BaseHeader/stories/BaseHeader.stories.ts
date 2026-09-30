import { args } from './args'
import * as cases from './cases'
import { render } from './render'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import BaseHeader from '../ui/BaseHeader.vue'
import type { Meta } from '@storybook/vue3-vite'

const meta = {
	title: 'Layout/BaseHeader',
	component: BaseHeader,
	parameters,
	argTypes,
	args,
	render,
} satisfies Meta<typeof BaseHeader>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const Landing = cases.Landing
export const App = cases.App
export const Shop = cases.Shop
export const WithSearch = cases.WithSearch
export const OverCover = cases.OverCover
export const Compact = cases.Compact
export const WithMenu = cases.WithMenu
export const Keyboard = cases.Keyboard
