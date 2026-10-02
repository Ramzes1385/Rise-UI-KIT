import { fn } from 'storybook/test'
import type { Meta } from '@storybook/vue3-vite'
import type BaseEventCalendar from '../ui/BaseEventCalendar.vue'

export const args = {
	events: [],
	view: 'month',
	date: '2026-10-02',
	today: '2026-10-02T10:30',
	'onEvent-click': fn(),
	variant: 'default',
	sizeScale: 100,
} satisfies Meta<typeof BaseEventCalendar>['args']
