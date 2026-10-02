import type { Meta } from '@storybook/vue3-vite'
import type BaseCountdown from '../ui/BaseCountdown.vue'

export const args = {
	to: 0,
	label: 'До конца распродажи',
	layout: 'blocks',
	isLive: false,
	variant: 'default',
	sizeScale: 100,
} satisfies Meta<typeof BaseCountdown>['args']
