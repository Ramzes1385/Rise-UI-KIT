import type { Meta } from '@storybook/vue3-vite'
import type BaseFooter from '../ui/BaseFooter.vue'

export const args = {
	variant: 'default',
	containerSize: 'full',
	sizeScale: 100,
} satisfies Meta<typeof BaseFooter>['args']
