import type BaseKbd from '../ui/BaseKbd.vue'
import type { Meta } from '@storybook/vue3-vite'

export const args = {
	value: 'K',
	variant: 'default',
	sizeScale: 100,
} satisfies Meta<typeof BaseKbd>['args']
