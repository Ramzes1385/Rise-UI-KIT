import type { Meta } from '@storybook/vue3-vite'
import BaseInfiniteScroll from '../ui/BaseInfiniteScroll.vue'
import { ORDERS_SCRIPT, template, useOrders } from './shared'
import { storySource, useStorySetup } from '@/stories/helpers'

export const source = storySource({
	template,
	imports: ['BaseInfiniteScroll', 'type InfiniteScrollLoadEvent'],
	vue: ['ref', 'useId'],
	script: ORDERS_SCRIPT,
})

export const render = ((args, { id }) => ({
	components: { BaseInfiniteScroll },
	setup: useStorySetup(args, { slots: ['onLoad'], data: { feedId: `feed-${id}` }, setup: () => useOrders() }),
	template,
})) satisfies Meta<typeof BaseInfiniteScroll>['render']
