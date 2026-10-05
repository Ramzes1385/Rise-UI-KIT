import { args } from './args'
import * as cases from './cases'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BaseBottomNav from '../ui/BaseBottomNav.vue'

const meta = {
	title: 'Navigation/BaseBottomNav',
	component: BaseBottomNav,
	parameters,
	argTypes,
	args,
} satisfies Meta<typeof BaseBottomNav>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const CustomColor = cases.CustomColor
export const Floating = cases.Floating
export const Glass = cases.Glass
export const Notched = cases.Notched
export const Links = cases.Links
export const Badges = cases.Badges
export const CustomSlots = cases.CustomSlots
export const LongContent = cases.LongContent
export const Disabled = cases.Disabled
export const Keyboard = cases.Keyboard
export const HideOnScroll = cases.HideOnScroll
export const Theming = cases.Theming
export const Animations = cases.Animations
