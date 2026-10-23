import { fn } from 'storybook/test'
import type BaseGantt from '../ui/BaseGantt.vue'
import type { Meta } from '@storybook/vue3-vite'
import { GANTT_TODAY, PROJECT_TASKS } from './shared'

export const args = {
	tasks: PROJECT_TASKS,
	today: GANTT_TODAY,
	scale: 'week',
	height: 420,
	isEditable: false,
	isDisabled: false,
	isLoading: false,
	isTodayVisible: true,
	variant: 'default',
	sizeScale: 100,
	'onUpdate:task': fn(),
	'onTask-change': fn(),
	'onTask-click': fn(),
	'onUpdate:collapsedIds': fn(),
} satisfies Meta<typeof BaseGantt>['args']
