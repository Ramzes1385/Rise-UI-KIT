import { fn } from 'storybook/test'
import type { Meta } from '@storybook/vue3-vite'
import type BaseProgress from '../ui/BaseProgress.vue'

export const args = {
	value: 60,
	max: 100,
	shape: 'line',
	animation: 'none',
	fill: 'solid',
	hasLabel: false,
	isIndeterminate: false,
	sizeScale: 100,
	onComplete: fn(),
} satisfies Meta<typeof BaseProgress>['args']
