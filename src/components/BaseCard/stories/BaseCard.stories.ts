import { args } from './args'
import * as cases from './cases'
import { render } from './render'
import { argTypes } from './argTypes'
import BaseCard from '../ui/BaseCard.vue'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'

const meta = {
	title: 'Element/BaseCard',
	component: BaseCard,
	parameters,
	argTypes,
	args,
	render,
} satisfies Meta<typeof BaseCard>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const CustomColor = cases.CustomColor
export const Padding = cases.Padding
export const Theming = cases.Theming
export const WithActions = cases.WithActions
export const WithFooter = cases.WithFooter
export const CustomHeader = cases.CustomHeader
export const LongContent = cases.LongContent
export const FixedHeight = cases.FixedHeight
export const Hoverable = cases.Hoverable
export const Clickable = cases.Clickable
export const Disabled = cases.Disabled
export const Animations = cases.Animations
