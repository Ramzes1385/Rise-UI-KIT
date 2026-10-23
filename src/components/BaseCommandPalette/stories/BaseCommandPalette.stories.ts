import { args } from './args'
import * as cases from './cases'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BaseCommandPalette from '../ui/BaseCommandPalette.vue'

const meta = {
	title: 'Overlay/BaseCommandPalette',
	component: BaseCommandPalette,
	parameters,
	argTypes,
	args,
} satisfies Meta<typeof BaseCommandPalette>

export default meta

export const Default = cases.Default
export const Open = cases.Open
export const Empty = cases.Empty
export const Variants = cases.Variants
export const HotkeyScope = cases.HotkeyScope
export const Theming = cases.Theming
export const Animations = cases.Animations
