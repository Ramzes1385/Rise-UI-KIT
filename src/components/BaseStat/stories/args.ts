import type BaseStat from '../ui/BaseStat.vue'
import type { Meta } from '@storybook/vue3-vite'

export const args = {
	label: 'Выручка',
	value: 4_820_000,
	valueFormat: { style: 'currency', currency: 'RUB', notation: 'compact', maximumFractionDigits: 2 },
	change: 0.12,
	changeLabel: 'к августу',
	isInverse: false,
	isLoading: false,
	variant: 'default',
	sizeScale: 100,
} satisfies Meta<typeof BaseStat>['args']
