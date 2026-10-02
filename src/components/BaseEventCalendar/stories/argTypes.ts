import type { Meta } from '@storybook/vue3-vite'
import type BaseEventCalendar from '../ui/BaseEventCalendar.vue'
import { ARG_GROUP, baseArgTypes, propGroup } from '@/stories/helpers'
import { EVENT_CALENDAR_VARIANTS, EVENT_CALENDAR_VIEWS } from '../types/BaseEventCalendar.types'

export const argTypes = {
	...baseArgTypes({ variants: EVENT_CALENDAR_VARIANTS }),
	events: { control: 'object', table: propGroup(ARG_GROUP.content) },
	view: { control: 'select', options: EVENT_CALENDAR_VIEWS, table: propGroup(ARG_GROUP.state) },
	date: { control: 'text', table: propGroup(ARG_GROUP.state) },
} satisfies Meta<typeof BaseEventCalendar>['argTypes']
