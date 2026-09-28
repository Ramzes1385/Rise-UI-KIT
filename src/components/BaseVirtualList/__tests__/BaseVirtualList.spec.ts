/** jsdom не считает раскладку: высота области подменяется через clientHeight. */

import '@testing-library/jest-dom/vitest'
import { nextTick, ref } from 'vue'
import BaseVirtualList from '../ui/BaseVirtualList.vue'
import { fireEvent, render, screen } from '@testing-library/vue'
import type { BaseVirtualListExpose } from '../types/BaseVirtualList.types'

const ORDERS = Array.from({ length: 1000 }, (_, index) => ({ id: `order-${index}`, title: `Заказ № ${index + 1}` }))

beforeAll(() => {
	Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
		configurable: true,
		get(this: HTMLElement) {
			return this.classList.contains('base-virtual-list') ? 100 : 0
		},
	})
})

/** Подмена снимается: clientHeight снова берётся у Element.prototype */
afterAll(() => {
	delete (HTMLElement.prototype as { clientHeight?: number }).clientHeight
})

function setup(props: Record<string, unknown> = {}, template = '<button type="button">{{ item.title }}</button>') {
	const api = ref<BaseVirtualListExpose | null>(null)
	const result = render({
		components: { BaseVirtualList },
		setup: () => ({ api, props: { items: ORDERS, ariaLabel: 'Заказы', ...props } }),
		template: `<BaseVirtualList ref="api" v-bind="props"><template #default="{ item, index }">${template}</template></BaseVirtualList>`,
	})
	const name = (props.ariaLabel as string | undefined) ?? 'Заказы'
	return { ...result, list: screen.getByRole('list', { name }), api: () => api.value as BaseVirtualListExpose }
}

describe('BaseVirtualList unit', () => {
	it('рендерит видимые строки с запасом; строки знают длину всего списка', async () => {
		const { list } = setup()
		await nextTick()
		const rows = screen.getAllByRole('listitem')
		// 100px области по 40px — строки 0–2 и 5 строк запаса снизу
		expect(rows).toHaveLength(8)
		expect(rows[0]).toHaveAttribute('aria-setsize', '1000')
		expect(rows[0]).toHaveAttribute('aria-posinset', '1')
		expect(rows[1]).toHaveStyle({ transform: 'translateY(40px)' })
		expect(list).toHaveAttribute('tabindex', '0')
		expect(list).toHaveStyle({ height: '400px' })
		expect(list.querySelector('.base-virtual-list__inner')).toHaveStyle({ height: '40000px' })
	})

	it('прокрутка меняет отрисованные строки', async () => {
		const { list } = setup()
		await nextTick()
		list.scrollTop = 4000
		await fireEvent.scroll(list)
		const rows = screen.getAllByRole('listitem')
		expect(rows[0]).toHaveAttribute('aria-posinset', '96')
		expect(rows[rows.length - 1]).toHaveAttribute('aria-posinset', '108')
	})

	it('строка с фокусом остаётся в DOM при прокрутке; уход фокуса снимает закрепление', async () => {
		const { list } = setup()
		await nextTick()
		const button = screen.getByRole('button', { name: 'Заказ № 2' })
		button.focus()
		list.scrollTop = 20000
		await fireEvent.scroll(list)
		expect(button).toBeInTheDocument()
		expect(button).toHaveFocus()
		const outside = document.createElement('button')
		document.body.append(outside)
		outside.focus()
		await nextTick()
		expect(screen.queryByRole('button', { name: 'Заказ № 2' })).not.toBeInTheDocument()
		list.focus()
		await nextTick()
		expect(screen.getAllByRole('listitem')[0]).toHaveAttribute('aria-posinset', '496')
		outside.remove()
	})

	it('ключ строки: функция, поле, id; для примитивов — индекс', async () => {
		setup({ itemKey: (item: { title: string }) => item.title, overscan: 0 })
		await nextTick()
		expect(screen.getAllByRole('listitem')).toHaveLength(3)
		const byField = setup({ items: ORDERS.slice(0, 2), itemKey: 'title', ariaLabel: 'По полю' })
		await nextTick()
		expect(byField.list).not.toHaveAttribute('tabindex')
		render(BaseVirtualList, {
			props: { items: ['Москва', 'Казань'], ariaLabel: 'Города', height: '50vh' },
			slots: { default: '<template #default="{ item }">{{ item }}</template>' },
		})
		const cities = screen.getByRole('list', { name: 'Города' })
		expect(cities).toHaveStyle({ height: '50vh' })
		expect(cities).toHaveTextContent('МоскваКазань')
		render(BaseVirtualList, { props: { items: [{ name: 'Без id' }], ariaLabel: 'Без ключа' } })
		expect(screen.getByRole('list', { name: 'Без ключа' }).querySelectorAll('[role="listitem"]')).toHaveLength(1)
	})

	it('методы scrollToIndex и getViewport', async () => {
		const { list, api } = setup({ itemSize: 20 })
		await nextTick()
		api().scrollToIndex(500, 'start')
		expect(list.scrollTop).toBe(10000)
		expect(api().getViewport()).toBe(list)
		await nextTick()
		expect(screen.getByRole('button', { name: 'Заказ № 501' })).toBeInTheDocument()
	})
})
