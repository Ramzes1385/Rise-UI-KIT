import { args } from './args'
import * as cases from './cases'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import BaseKanban from '../ui/BaseKanban.vue'
import type { Meta } from '@storybook/vue3-vite'

const meta = {
	title: 'Data/BaseKanban',
	component: BaseKanban,
	parameters,
	argTypes,
	args,
} satisfies Meta<typeof BaseKanban>

export default meta

export const Default = cases.Default
export const MouseDrag = cases.MouseDrag
export const WipLimits = cases.WipLimits
export const CustomCard = cases.CustomCard
export const ContextMenu = cases.ContextMenu
export const FullBoard = cases.FullBoard
export const Disabled = cases.Disabled
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const CustomColor = cases.CustomColor
