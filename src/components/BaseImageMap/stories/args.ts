import { fn } from 'storybook/test'
import { IMAGE_MAP_HOTSPOTS } from './fixtures'
import type { Meta } from '@storybook/vue3-vite'
import type BaseImageMap from '../ui/BaseImageMap.vue'

export const args = {
	data: IMAGE_MAP_HOTSPOTS,
	onSelect: fn(),
	variant: 'default',
	sizeScale: 100,
} satisfies Meta<typeof BaseImageMap>['args']
