import type { Meta } from '@storybook/vue3-vite'
import type BaseLoader from '../ui/BaseLoader.vue'

export const args = {
	variant: 'spinner',
	hasLabel: false,
	isOverlay: false,
	sizeScale: 100,
} satisfies Meta<typeof BaseLoader>['args']
