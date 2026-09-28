import { fn } from 'storybook/test'
import type BaseBadge from '../ui/BaseBadge.vue'
import type { Meta } from '@storybook/vue3-vite'

export const args = {
	label: 'Новый',
	variant: 'default',
	sizeScale: 100,
	onClick: fn(),
} satisfies Meta<typeof BaseBadge>['args']
