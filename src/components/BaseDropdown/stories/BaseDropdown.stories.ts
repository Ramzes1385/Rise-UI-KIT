import { args } from './args'
import * as cases from './cases'
import { render } from './render'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BaseDropdown from '../ui/BaseDropdown.vue'

const meta = {
	title: 'Overlay/BaseDropdown',
	component: BaseDropdown,
	parameters,
	argTypes,
	args,
	render,
} satisfies Meta<typeof BaseDropdown>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const CustomColor = cases.CustomColor
export const Empty = cases.Empty
export const LongContent = cases.LongContent
export const Positions = cases.Positions
export const ViewportEdge = cases.ViewportEdge
export const InDarkBlock = cases.InDarkBlock
export const WithField = cases.WithField
export const Keyboard = cases.Keyboard
export const DialogPanel = cases.DialogPanel
export const TabFromPanel = cases.TabFromPanel
