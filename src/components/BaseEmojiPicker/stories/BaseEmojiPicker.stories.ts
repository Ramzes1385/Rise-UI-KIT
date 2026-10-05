import { args } from './args'
import * as cases from './cases'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BaseEmojiPicker from '../ui/BaseEmojiPicker.vue'

const meta = {
	title: 'Chat/BaseEmojiPicker',
	component: BaseEmojiPicker,
	parameters,
	argTypes,
	args,
} satisfies Meta<typeof BaseEmojiPicker>

export default meta

export const Default = cases.Default
export const WithRecent = cases.WithRecent
export const CustomSet = cases.CustomSet
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const CustomColor = cases.CustomColor
export const Disabled = cases.Disabled
export const Theming = cases.Theming
export const Animations = cases.Animations
