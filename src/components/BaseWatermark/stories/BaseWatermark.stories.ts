import { args } from './args'
import * as cases from './cases'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BaseWatermark from '../ui/BaseWatermark.vue'

const meta = {
	title: 'Element/BaseWatermark',
	component: BaseWatermark,
	parameters,
	argTypes,
	args,
} satisfies Meta<typeof BaseWatermark>

export default meta

export const Default = cases.Default
export const Text = cases.Text
export const MultiLine = cases.MultiLine
export const Image = cases.Image
export const Rotate = cases.Rotate
export const Protected = cases.Protected
export const Theming = cases.Theming
export const Keyboard = cases.Keyboard
