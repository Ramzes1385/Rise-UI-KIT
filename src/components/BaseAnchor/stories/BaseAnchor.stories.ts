import { args } from './args'
import * as cases from './cases'
import { render } from './render'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import BaseAnchor from '../ui/BaseAnchor.vue'
import type { Meta } from '@storybook/vue3-vite'

const meta = {
	title: 'Navigation/BaseAnchor',
	component: BaseAnchor,
	parameters,
	argTypes,
	args,
	render,
} satisfies Meta<typeof BaseAnchor>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const CustomColor = cases.CustomColor
export const Horizontal = cases.Horizontal
export const Empty = cases.Empty
export const ItemSlot = cases.ItemSlot
export const LongContent = cases.LongContent
export const Keyboard = cases.Keyboard
