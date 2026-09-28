/**
 * BaseInfiniteScroll — stories.
 *
 * Разделы: Default (лента в прокручиваемом блоке) → кнопка «Загрузить еще» → ошибка и повтор → клавиатура.
 */

import { expect, fn, waitFor } from 'storybook/test'
import { ref } from 'vue'
import { ARG_GROUP, baseArgTypes, hiddenArgTypes, propGroup, tabTo, useArgsWithoutSlots } from '@/stories/helpers'
import BaseInfiniteScroll from '../ui/BaseInfiniteScroll.vue'
import type { InfiniteScrollLoadEvent } from '../model/BaseInfiniteScroll.types'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

/** Сколько заказов в одной подгрузке и всего */
const PAGE = 10
const TOTAL = 40

function order(index: number): string {
	return `Заказ № ${1000 + index} — ${((index * 1370) % 9000) + 500} ₽`
}

/**
 * Лента заказов: подгрузка через 300 мс, после TOTAL — конец списка. failFirst — первая подгрузка падает
 * (пример ошибки и кнопки «Повторить»)
 */
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

const meta = {
	title: 'Data/BaseInfiniteScroll',
	component: BaseInfiniteScroll,
	parameters: {
		docs: {
			description: {
				component: [
					'Бесконечная прокрутка: следующая часть списка подгружается, когда конец списка подходит к краю области.',
					'',
					'- Событие `load` приходит с `done`: вызовите `done("ok")`, если есть ещё, `done("empty")` в конце списка,',
					'  `done("error")` при ошибке — появится кнопка «Повторить». Пока идёт загрузка, у списка `aria-busy`.',
					'- `mode="manual"` — вместо автоматической подгрузки кнопка «Загрузить еще»: так подвал страницы остаётся',
					'  достижимым, а подгрузка — под контролем пользователя.',
					'- `root` — прокручиваемый контейнер (селектор или элемент), по умолчанию окно; `distance` — запас в пикселях.',
					'- Строка состояния (`role="status"`) объявляет загрузку, конец списка и ошибку. Тексты меняются пропсами.',
					'- `reset()` через ref — начать заново после смены фильтра.',
				].join('\n'),
			},
		},
	},
	argTypes: {
		...baseArgTypes(),
		...hiddenArgTypes('variant', 'color'),
		mode: { control: 'inline-radio', options: ['intersect', 'manual'], table: propGroup(ARG_GROUP.behavior) },
		distance: { control: 'number', table: propGroup(ARG_GROUP.behavior) },
		root: { control: false, table: propGroup(ARG_GROUP.behavior) },
		loadingText: { control: 'text', table: propGroup(ARG_GROUP.content) },
		emptyText: { control: 'text', table: propGroup(ARG_GROUP.content) },
		errorText: { control: 'text', table: propGroup(ARG_GROUP.content) },
		loadMoreText: { control: 'text', table: propGroup(ARG_GROUP.content) },
	},
	args: {
		mode: 'intersect',
		distance: 100,
		emptyText: 'Это все заказы',
		sizeScale: 100,
		onLoad: fn(),
	},
	render: (args, { id }) => ({
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
	}),
} satisfies Meta<typeof BaseInfiniteScroll>

export default meta
type Story = StoryObj<typeof meta>

function items(canvasElement: HTMLElement): number {
	return canvasElement.querySelectorAll('li').length
}

// ─── Default ───────────────────────────────────────────────────────────────────

/** Прокрутите ленту вниз: заказы подгружаются по десять, после сорока — «Это все заказы». */
export const Default: Story = {
	play: async ({ canvas, canvasElement }) => {
		const feed = canvas.getByRole('region', { name: 'Лента заказов' })
		await expect(items(canvasElement)).toBe(PAGE)
		feed.scrollTop = feed.scrollHeight
		await waitFor(() => expect(items(canvasElement)).toBeGreaterThan(PAGE), { timeout: 3000 })
	},
}

// ─── Сценарии ──────────────────────────────────────────────────────────────────

/** Режим `manual`: подгрузка по кнопке «Загрузить еще». */
export const Manual: Story = {
	args: { mode: 'manual' },
	play: async ({ canvas, canvasElement, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Загрузить еще' }))
		await waitFor(() => expect(items(canvasElement)).toBe(PAGE * 2))
	},
}

/** Ошибка подгрузки: текст ошибки и кнопка «Повторить». */
export const WithError: Story = {
	args: { mode: 'manual' },
	play: async ({ canvas, canvasElement, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Загрузить еще' }))
		await expect(await canvas.findByText('Не удалось загрузить')).toBeVisible()
		await userEvent.click(canvas.getByRole('button', { name: 'Повторить' }))
		await waitFor(() => expect(items(canvasElement)).toBe(PAGE * 2))
	},
}

// ─── Клавиатура ────────────────────────────────────────────────────────────────

/** Клавиатура: в режиме manual Tab доходит до кнопки «Загрузить еще», Enter подгружает. */
export const Keyboard: Story = {
	tags: ['!autodocs'],
	args: { mode: 'manual' },
	play: async ({ canvas, canvasElement, userEvent }) => {
		await tabTo(canvas.getByRole('button', { name: 'Загрузить еще' }), userEvent)
		await userEvent.keyboard('{Enter}')
		await expect(await canvas.findByRole('status')).toHaveTextContent('Загрузка...')
		await waitFor(() => expect(items(canvasElement)).toBe(PAGE * 2))
	},
}
