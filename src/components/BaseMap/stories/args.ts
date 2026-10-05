import type BaseMap from '../ui/BaseMap.vue'
import type { Meta } from '@storybook/vue3-vite'

export const args = {
	provider: 'yandex',
	zoom: 10,
	height: '360px',
	variant: 'default',
	sizeScale: 100,
} satisfies Meta<typeof BaseMap>['args']
