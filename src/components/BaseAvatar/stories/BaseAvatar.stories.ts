import { args } from './args'
import * as cases from './cases'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import BaseAvatar from '../ui/BaseAvatar.vue'
import type { Meta } from '@storybook/vue3-vite'

const meta = {
	title: 'Element/BaseAvatar',
	component: BaseAvatar,
	parameters,
	argTypes,
	args,
} satisfies Meta<typeof BaseAvatar>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const Shapes = cases.Shapes
export const CustomColor = cases.CustomColor
export const WithImage = cases.WithImage
export const Fallback = cases.Fallback
export const WithSlot = cases.WithSlot
export const OnlineStatus = cases.OnlineStatus
export const Group = cases.Group
export const Rings = cases.Rings
export const Media = cases.Media
export const Mascots = cases.Mascots
export const Moods = cases.Moods
export const Animations = cases.Animations
export const Password = cases.Password
export const Clickable = cases.Clickable
export const Disabled = cases.Disabled
