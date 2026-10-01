import type { Meta } from '@storybook/vue3-vite'
import type BaseCalendar from '../ui/BaseCalendar.vue'
import { CALENDAR_VARIANTS } from '../types/BaseCalendar.types'
import { baseArgTypes, propGroup, ARG_GROUP } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: CALENDAR_VARIANTS }),
	modelValue: { control: false, table: propGroup(ARG_GROUP.content) },
	modelValueEnd: { control: false, table: propGroup(ARG_GROUP.content) },
	selectedDates: { control: false, table: propGroup(ARG_GROUP.content) },
	highlights: { control: 'object', table: propGroup(ARG_GROUP.content) },
	weekends: { control: 'object', table: propGroup(ARG_GROUP.content) },
	initialMonth: { control: { type: 'number', min: 0, max: 11 }, table: propGroup(ARG_GROUP.content) },
	initialYear: { control: 'number', table: propGroup(ARG_GROUP.content) },
	displayConfig: { control: 'object', table: propGroup(ARG_GROUP.appearance) },
	constraints: { control: 'object', table: propGroup(ARG_GROUP.state) },
	isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	selectionMode: { control: 'inline-radio', options: ['single', 'range', 'multiple'], table: propGroup(ARG_GROUP.behavior) },
	timeConfig: { control: 'object', table: propGroup(ARG_GROUP.behavior) },
	isAm: { control: false, table: propGroup(ARG_GROUP.behavior) },
	firstDayOfWeek: { control: 'inline-radio', options: [1, 0], table: propGroup(ARG_GROUP.behavior) },
	locale: { control: 'text', table: propGroup(ARG_GROUP.behavior) },
	showDatePopover: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
} satisfies Meta<typeof BaseCalendar>['argTypes']
