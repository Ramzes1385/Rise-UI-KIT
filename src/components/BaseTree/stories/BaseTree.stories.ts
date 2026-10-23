import { args } from './args'
import * as cases from './cases'
import { render } from './render'
import { argTypes } from './argTypes'
import BaseTree from '../ui/BaseTree.vue'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'

const meta = {
	title: 'Data/BaseTree',
	component: BaseTree,
	parameters,
	argTypes,
	args,
	render,
} satisfies Meta<typeof BaseTree>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const CustomColor = cases.CustomColor
export const Theming = cases.Theming
export const ArrowRight = cases.ArrowRight
export const Disabled = cases.Disabled
export const Empty = cases.Empty
export const LongContent = cases.LongContent
export const SelectionModes = cases.SelectionModes
export const Cascade = cases.Cascade
export const Slots = cases.Slots
export const LabelById = cases.LabelById
export const Controlled = cases.Controlled
export const Links = cases.Links
export const Virtual = cases.Virtual
export const Keyboard = cases.Keyboard
export const Animations = cases.Animations
