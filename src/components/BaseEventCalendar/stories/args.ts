import { fn } from 'storybook/test'
import { STORY_EVENTS } from './shared'
import type { Meta } from '@storybook/vue3-vite'
import type BaseEventCalendar from '../ui/BaseEventCalendar.vue'

export const args = {
	events: STORY_EVENTS,
	view: 'month',
	date: '2026-10-02',
	today: '2026-10-02T10:30',
	'onEvent-click': fn(),
	'onPeriod-change': fn(),
	onSelect: fn(),
	onCreate: fn(),
	'onEvent-change': fn(),
	variant: 'default',
	sizeScale: 100,
} satisfies Meta<typeof BaseEventCalendar>['args']
