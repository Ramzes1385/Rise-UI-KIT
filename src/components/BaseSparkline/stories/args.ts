import { MONTHS, REVENUE } from './shared'
import type { Meta } from '@storybook/vue3-vite'
import type BaseSparkline from '../ui/BaseSparkline.vue'

export const args = {
	values: REVENUE,
	labels: MONTHS,
	label: 'Выручка за год, тыс. ₽',
	variant: 'line',
	height: 32,
	sizeScale: 100,
} satisfies Meta<typeof BaseSparkline>['args']
