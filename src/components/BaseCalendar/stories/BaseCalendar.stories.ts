import { args } from './args'
import * as cases from './cases'
import { render } from './render'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BaseCalendar from '../ui/BaseCalendar.vue'

const meta = {
	title: 'Data/BaseCalendar',
	component: BaseCalendar,
	parameters,
	argTypes,
	args,
	render,
} satisfies Meta<typeof BaseCalendar>

export default meta

export const Default = cases.Default
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const CustomColor = cases.CustomColor
export const Theming = cases.Theming
export const Disabled = cases.Disabled
export const Constraints = cases.Constraints
export const RangeSelection = cases.RangeSelection
export const MultipleSelection = cases.MultipleSelection
export const WithTime = cases.WithTime
export const Time12Hour = cases.Time12Hour
export const WeekNumbers = cases.WeekNumbers
export const Locale = cases.Locale
export const Events = cases.Events
export const CustomDay = cases.CustomDay
export const SwitchView = cases.SwitchView
export const Keyboard = cases.Keyboard
export const Animations = cases.Animations
