import { args } from './args'
import * as cases from './cases'
import { render } from './render'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BaseColorPicker from '../ui/BaseColorPicker.vue'

const meta = {
	title: 'Form/BaseColorPicker',
	component: BaseColorPicker,
	parameters,
	argTypes,
	args,
	render,
} satisfies Meta<typeof BaseColorPicker>

export default meta

export const Default = cases.Default
export const Sizes = cases.Sizes
export const Disabled = cases.Disabled
export const Presets = cases.Presets
export const Palettes = cases.Palettes
export const Minimal = cases.Minimal
export const TriggerSlot = cases.TriggerSlot
export const HexInput = cases.HexInput
export const ColorPickerHexDraft = cases.ColorPickerHexDraft
export const Formats = cases.Formats
export const Resettable = cases.Resettable
export const Keyboard = cases.Keyboard
export const AriaLabel = cases.AriaLabel
export const Theming = cases.Theming
export const Animations = cases.Animations
