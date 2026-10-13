import type BaseGrid from '../ui/BaseGrid.vue'
import type { Meta } from '@storybook/vue3-vite'

export const args = {
	cols: 12,
	gap: 'md',
	tag: 'div',
	sizeScale: 100,
} satisfies Meta<typeof BaseGrid>['args']
