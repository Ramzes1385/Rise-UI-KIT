import type { Meta } from '@storybook/vue3-vite'
import type BaseAnchor from '../ui/BaseAnchor.vue'

export const args = {
	variant: 'default',
	direction: 'vertical',
	sizeScale: 100,
} satisfies Meta<typeof BaseAnchor>['args']
