import { args } from './args'
import * as cases from './cases'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BaseWaveform from '../ui/BaseWaveform.vue'

const meta = {
	title: 'Media/BaseWaveform',
	component: BaseWaveform,
	parameters,
	argTypes,
	args,
} satisfies Meta<typeof BaseWaveform>

export default meta

export const Default = cases.Default
export const Selection = cases.Selection
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const CustomColor = cases.CustomColor
export const Disabled = cases.Disabled
