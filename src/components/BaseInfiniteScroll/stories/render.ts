import { ref } from 'vue'
import { PAGE } from './shared'
import type { Meta } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import BaseInfiniteScroll from '../ui/BaseInfiniteScroll.vue'
import type { InfiniteScrollLoadEvent } from '../types/BaseInfiniteScroll.types'

const TOTAL = 40

function order(index: number): string {
	return `Заказ № ${1000 + index} — ${((index * 1370) % 9000) + 500} ₽`
}

function useOrders(failFirst = false) {
	const orders = ref(Array.from({ length: PAGE }, (_, index) => order(index)))
	let hasFailed = !failFirst
	function onLoad({ done }: InfiniteScrollLoadEvent): void {
		setTimeout(() => {
			if (!hasFailed) {
				hasFailed = true
				done('error')
				return
			}
			const start = orders.value.length
			orders.value.push(...Array.from({ length: PAGE }, (_, index) => order(start + index)))
			done(orders.value.length >= TOTAL ? 'empty' : 'ok')
		}, 300)
	}
	return { orders, onLoad }
}

export const render = ((args, { id }) => ({
	components: { BaseInfiniteScroll },
	setup: () => ({ props: useArgsWithoutSlots(args, ['onLoad']), ...useOrders(id.endsWith('error')), feedId: `feed-${id}` }),
	template: `
			<div :id="feedId" style="height: 260px; max-width: 420px; overflow: auto; border: 1px solid var(--rise-border); border-radius: 8px" tabindex="0" aria-label="Лента заказов" role="region">
				<BaseInfiniteScroll v-bind="props" :root="'#' + feedId" @load="onLoad">
					<ul aria-label="Заказы" style="margin: 0; padding: 8px 16px; list-style: none; display: grid; gap: 12px">
						<li v-for="item in orders" :key="item">{{ item }}</li>
					</ul>
				</BaseInfiniteScroll>
			</div>
		`,
})) satisfies Meta<typeof BaseInfiniteScroll>['render']
