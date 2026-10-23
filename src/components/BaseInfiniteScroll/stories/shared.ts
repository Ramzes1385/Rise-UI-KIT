import { ref } from 'vue'
import type { Ref } from 'vue'
import type { InfiniteScrollLoadEvent } from '../types/BaseInfiniteScroll.types'

export const PAGE = 10

const TOTAL = 40

export function items(canvasElement: HTMLElement): number {
	return canvasElement.querySelectorAll('li').length
}

function order(index: number): string {
	return `Заказ № ${1000 + index} — ${((index * 1370) % 9000) + 500} ₽`
}

export function useOrders(failFirst = false): { orders: Ref<string[]>; onLoad: (event: InfiniteScrollLoadEvent) => void } {
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

export const template = `
	<div :id="feedId" style="height: 260px; max-width: 420px; overflow: auto; border: 1px solid var(--rise-border); border-radius: 8px" tabindex="0" aria-label="Лента заказов" role="region">
		<BaseInfiniteScroll v-bind="args" :root="'#' + feedId" @load="onLoad">
			<ul aria-label="Заказы" style="margin: 0; padding: 8px 16px; list-style: none; display: grid; gap: 12px">
				<li v-for="item in orders" :key="item">{{ item }}</li>
			</ul>
		</BaseInfiniteScroll>
	</div>
`

const ORDERS = [
	`const page = ${PAGE}`,
	`const total = ${TOTAL}`,
	'const feedId = useId()',
	'const orders = ref(Array.from({ length: page }, (_, index) => order(index)))',
	'',
	'function order(index: number): string {',
	'\treturn `Заказ № ${1000 + index} — ${((index * 1370) % 9000) + 500} ₽`',
	'}',
	'',
]

const LOAD_MORE = [
	'\t\tconst start = orders.value.length',
	'\t\torders.value.push(...Array.from({ length: page }, (_, index) => order(start + index)))',
	"\t\tdone(orders.value.length >= total ? 'empty' : 'ok')",
	'\t}, 300)',
	'}',
]

export const ORDERS_SCRIPT = [
	...ORDERS,
	'function onLoad({ done }: InfiniteScrollLoadEvent): void {',
	'\tsetTimeout(() => {',
	...LOAD_MORE,
].join('\n')

export const FAILING_ORDERS_SCRIPT = [
	...ORDERS,
	'let hasFailed = false',
	'',
	'function onLoad({ done }: InfiniteScrollLoadEvent): void {',
	'\tsetTimeout(() => {',
	'\t\tif (!hasFailed) {',
	'\t\t\thasFailed = true',
	"\t\t\tdone('error')",
	'\t\t\treturn',
	'\t\t}',
	...LOAD_MORE,
].join('\n')
