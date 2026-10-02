import type { Meta } from '@storybook/vue3-vite'
import type BaseAnchor from '../ui/BaseAnchor.vue'

export const args = {
	label: 'Пример',
	variant: 'default',
	sizeScale: 100,
} satisfies Meta<typeof BaseAnchor>['args']
