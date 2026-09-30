import { fn } from 'storybook/test'
import { STORY_TODAY } from '@/stories/helpers'
import type { Meta } from '@storybook/vue3-vite'
import type BaseCalendar from '../ui/BaseCalendar.vue'

export const args = {
	selectionMode: 'single',
	variant: 'default',
	sizeScale: 100,
	initialMonth: STORY_TODAY.getMonth(),
	initialYear: STORY_TODAY.getFullYear(),
	showDatePopover: false,
	isDisabled: false,
	'onUpdate:modelValue': fn(),
	'onDate-click': fn(),
	'onMonth-change': fn(),
	'onView-change': fn(),
} satisfies Meta<typeof BaseCalendar>['args']
