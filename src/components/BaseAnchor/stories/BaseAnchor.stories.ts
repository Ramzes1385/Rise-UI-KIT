import { args } from './args'
import * as cases from './cases'
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
} satisfies Meta<typeof BaseAnchor>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const CustomColor = cases.CustomColor
export const Empty = cases.Empty
export const LongContent = cases.LongContent
