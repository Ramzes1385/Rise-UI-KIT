import { fn } from 'storybook/test'
import type BaseChart from '../ui/BaseChart.vue'
import type { Meta } from '@storybook/vue3-vite'
import { MONTHS, REVENUE_SERIES } from './shared'

export const args = {
	label: 'Выручка и расходы за 2026 год',
	series: REVENUE_SERIES,
	labels: MONTHS,
	variant: 'line',
	isStacked: false,
	hasGrid: true,
	hasLegend: true,
	height: 240,
	yTickCount: 5,
	sizeScale: 100,
	'onUpdate:hiddenSeries': fn(),
} satisfies Meta<typeof BaseChart>['args']
