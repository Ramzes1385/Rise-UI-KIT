import { fn } from 'storybook/test'
import type BaseChip from '../ui/BaseChip.vue'
import type { Meta } from '@storybook/vue3-vite'

export const args = {
	content: 5,
	placement: 'top-right',
	variant: 'default',
	hasOverflow: false,
	maxValue: 99,
	isHiddenOnZero: false,
	sizeScale: 100,
	'onClick-badge': fn(),
} satisfies Meta<typeof BaseChip>['args']
