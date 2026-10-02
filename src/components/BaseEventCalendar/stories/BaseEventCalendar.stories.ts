import { args } from './args'
import * as cases from './cases'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BaseEventCalendar from '../ui/BaseEventCalendar.vue'

const meta = {
	title: 'Data/BaseEventCalendar',
	component: BaseEventCalendar,
	parameters,
	argTypes,
	args,
} satisfies Meta<typeof BaseEventCalendar>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const CustomColor = cases.CustomColor
export const Empty = cases.Empty
