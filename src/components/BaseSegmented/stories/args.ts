import { PERIODS } from './shared'
import { fn } from 'storybook/test'
import type { Meta } from '@storybook/vue3-vite'
import type BaseSegmented from '../ui/BaseSegmented.vue'

export const args = {
	modelValue: 'week',
	options: PERIODS,
	label: 'Период отчёта',
	isBlock: false,
	isDisabled: false,
	variant: 'default',
	sizeScale: 100,
	onChange: fn(),
} satisfies Meta<typeof BaseSegmented>['args']
