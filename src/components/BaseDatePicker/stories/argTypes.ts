import type { Meta } from '@storybook/vue3-vite'
import { INPUT_VARIANTS } from '@components/BaseInput'
import type BaseDatePicker from '../ui/BaseDatePicker.vue'
import { CALENDAR_VARIANTS } from '@components/BaseCalendar'
import { baseArgTypes, propGroup, ARG_GROUP, hiddenArgTypes } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes(),
	modelValue: { control: false, table: propGroup(ARG_GROUP.content) },
	modelValueEnd: { control: false, table: propGroup(ARG_GROUP.content) },
	selectedDates: { control: false, table: propGroup(ARG_GROUP.content) },
	label: { control: 'text', table: propGroup(ARG_GROUP.content) },
	placeholder: { control: 'text', table: propGroup(ARG_GROUP.content) },
	highlights: { control: 'object', table: propGroup(ARG_GROUP.content) },
	weekends: { control: 'object', table: propGroup(ARG_GROUP.content) },
	inputVariant: { control: 'inline-radio', options: [...INPUT_VARIANTS], table: propGroup(ARG_GROUP.appearance) },
	calendarVariant: { control: 'inline-radio', options: [...CALENDAR_VARIANTS], table: propGroup(ARG_GROUP.appearance) },
	isMultiMonth: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
	gap: { control: { type: 'number', min: 0, max: 24 }, table: propGroup(ARG_GROUP.appearance) },
	error: { control: 'text', table: propGroup(ARG_GROUP.state) },
	isRequired: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	isReadonly: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	isClearable: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	minDate: { control: false, table: propGroup(ARG_GROUP.state) },
	maxDate: { control: false, table: propGroup(ARG_GROUP.state) },
	disabledDates: { control: false, table: propGroup(ARG_GROUP.state) },
	disabledWeekdays: { control: 'object', table: propGroup(ARG_GROUP.state) },
	disableFrom: { control: false, table: propGroup(ARG_GROUP.state) },
	disableTo: { control: false, table: propGroup(ARG_GROUP.state) },
	selectionMode: { control: 'inline-radio', options: ['single', 'range', 'multiple'], table: propGroup(ARG_GROUP.behavior) },
	showTime: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	showSeconds: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	is24Hour: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	showWeekNumber: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	firstDayOfWeek: { control: 'inline-radio', options: [1, 0], table: propGroup(ARG_GROUP.behavior) },
	locale: { control: 'text', table: propGroup(ARG_GROUP.behavior) },
	closeOnClickOutside: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	closeOnEscape: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	calendarConfig: { control: 'object', table: propGroup(ARG_GROUP.behavior) },
	...hiddenArgTypes('variant', 'dateFormat'),
} satisfies Meta<typeof BaseDatePicker>['argTypes']
