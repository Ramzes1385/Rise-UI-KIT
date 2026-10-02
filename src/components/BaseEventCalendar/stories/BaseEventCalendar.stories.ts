import { args } from './args'
import * as cases from './cases'
import { render } from './render'
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
	render,
} satisfies Meta<typeof BaseEventCalendar>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const CustomColor = cases.CustomColor
export const Month = cases.Month
export const Week = cases.Week
export const Day = cases.Day
export const List = cases.List
export const MultiDay = cases.MultiDay
export const Recurring = cases.Recurring
export const DynamicSlots = cases.DynamicSlots
export const Locale = cases.Locale
export const Empty = cases.Empty
export const LongContent = cases.LongContent
export const SwitchView = cases.SwitchView
export const Keyboard = cases.Keyboard
