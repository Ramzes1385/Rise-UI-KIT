import type { Meta } from '@storybook/vue3-vite'
import type BaseEventCalendar from '../ui/BaseEventCalendar.vue'
import { ARG_GROUP, baseArgTypes, propGroup } from '@/stories/helpers'
import { EVENT_CALENDAR_VARIANTS, EVENT_CALENDAR_VIEWS } from '../types/BaseEventCalendar.types'

export const argTypes = {
	...baseArgTypes({ variants: EVENT_CALENDAR_VARIANTS }),
	events: { control: 'object', table: propGroup(ARG_GROUP.content) },
	view: { control: 'select', options: EVENT_CALENDAR_VIEWS, table: propGroup(ARG_GROUP.state) },
	date: { control: 'text', table: propGroup(ARG_GROUP.state) },
	today: { control: 'text', table: propGroup(ARG_GROUP.state) },
	views: { control: 'check', options: EVENT_CALENDAR_VIEWS, table: propGroup(ARG_GROUP.behavior) },
	slotDuration: { control: { type: 'select' }, options: [15, 30, 60], table: propGroup(ARG_GROUP.behavior) },
	workHours: { control: 'object', table: propGroup(ARG_GROUP.behavior) },
	firstDayOfWeek: { control: { type: 'select' }, options: [0, 1], table: propGroup(ARG_GROUP.behavior) },
	maxEventsPerDay: { control: { type: 'number', min: 1, max: 10 }, table: propGroup(ARG_GROUP.behavior) },
	isSelectable: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	isEditable: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	canMove: { control: false, table: propGroup(ARG_GROUP.behavior) },
	hasNowIndicator: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
} satisfies Meta<typeof BaseEventCalendar>['argTypes']
