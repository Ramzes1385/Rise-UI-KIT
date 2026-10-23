import type { Meta } from '@storybook/vue3-vite'
import type BaseTextDiff from '../ui/BaseTextDiff.vue'
import { CONTRACT_AFTER, CONTRACT_BEFORE } from './shared'

export const args = {
	before: CONTRACT_BEFORE,
	after: CONTRACT_AFTER,
	label: 'Договор, раздел 4',
	mode: 'unified',
	isWordDiff: true,
	variant: 'default',
	sizeScale: 100,
} satisfies Meta<typeof BaseTextDiff>['args']
