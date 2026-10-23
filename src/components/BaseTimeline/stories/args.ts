import { ORDER } from './shared'
import type { Meta } from '@storybook/vue3-vite'
import type BaseTimeline from '../ui/BaseTimeline.vue'

export const args = {
	items: ORDER,
	currentId: 'shipped',
	orientation: 'vertical',
	variant: 'default',
	sizeScale: 100,
} satisfies Meta<typeof BaseTimeline>['args']
