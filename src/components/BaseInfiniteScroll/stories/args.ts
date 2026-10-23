import { fn } from 'storybook/test'
import type { Meta } from '@storybook/vue3-vite'
import type BaseInfiniteScroll from '../ui/BaseInfiniteScroll.vue'

export const args = {
	mode: 'intersect',
	distance: 100,
	emptyText: 'Это все заказы',
	sizeScale: 100,
	onLoad: fn(),
} satisfies Meta<typeof BaseInfiniteScroll>['args']
