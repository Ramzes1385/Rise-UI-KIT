import { TASKS_BY_STATUS } from './shared'
import type { Meta } from '@storybook/vue3-vite'
import type BasePieChart from '../ui/BasePieChart.vue'

export const args = {
	segments: TASKS_BY_STATUS,
	label: 'задач',
	variant: 'donut',
	maxSegments: 6,
	size: 160,
	animation: 'sweep',
	sizeScale: 100,
} satisfies Meta<typeof BasePieChart>['args']
