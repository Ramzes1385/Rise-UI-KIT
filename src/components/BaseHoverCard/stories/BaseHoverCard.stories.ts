import { args } from './args'
import * as cases from './cases'
import { render } from './render'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BaseHoverCard from '../ui/BaseHoverCard.vue'

const meta = {
	title: 'Overlay/BaseHoverCard',
	component: BaseHoverCard,
	parameters,
	argTypes,
	args,
	render,
} satisfies Meta<typeof BaseHoverCard>

export default meta

export const Default = cases.Default
export const Profile = cases.Profile
export const Link = cases.Link
export const Delays = cases.Delays
export const Placement = cases.Placement
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const CustomColor = cases.CustomColor
export const LongContent = cases.LongContent
export const Disabled = cases.Disabled
export const Keyboard = cases.Keyboard
export const Theming = cases.Theming
export const Animations = cases.Animations
