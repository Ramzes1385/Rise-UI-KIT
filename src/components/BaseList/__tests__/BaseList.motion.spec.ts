import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import BaseList from '../ui/BaseList.vue'
import type { ListItem } from '../types/BaseList.types'
import { render, screen, waitFor } from '@testing-library/vue'

const ROWS: ListItem[] = [
	{ id: 'a', title: 'Альфа' },
	{ id: 'b', title: 'Бета' },
	{ id: 'c', title: 'Гамма' },
]

const global = { stubs: { Transition: false, TransitionGroup: false } }

function setup(props: Record<string, unknown> = {}) {
	return render(BaseList, { props: { items: ROWS, ariaLabel: 'Разделы', ...props }, global })
}

describe('BaseList: движение строк', () => {
	it('строки — прямые потомки списка, без обёртки', () => {
		const { container } = setup()

		expect(container.querySelectorAll('ul > li')).toHaveLength(3)
	})

	it('удалённая строка уходит на своём месте: вне потока, без id и скрыта от скринридера', async () => {
		const { container, rerender } = setup()

		await rerender({ items: [ROWS[0], ROWS[2]] })
		const leaving = container.querySelector<HTMLElement>('.base-list__item-leave-active')!

		expect(leaving).toHaveTextContent('Бета')
		expect(leaving).not.toHaveAttribute('data-list-id')
		expect(leaving).toHaveAttribute('aria-hidden', 'true')
		expect(leaving.style.top).toBe('0px')
		expect(leaving.style.left).toBe('0px')
		expect(leaving.style.width).toBe('0px')
		expect(screen.getAllByRole('listitem').map(row => row.dataset.listId)).toEqual(['a', 'c'])
		await waitFor(() => expect(container.querySelectorAll('li')).toHaveLength(2))
	})

	it('новая строка появляется через классы перехода', async () => {
		const { container, rerender } = setup()

		await rerender({ items: [...ROWS, { id: 'd', title: 'Дельта' }] })

		expect(container.querySelector('[data-list-id="d"]')).toHaveClass('base-list__item-enter-active')
		await waitFor(() => expect(container.querySelector('[data-list-id="d"]')).not.toHaveClass('base-list__item-enter-active'))
	})

	it('isVirtual: строки без переходов — удалённая исчезает сразу', async () => {
		const { container, rerender } = setup({ isVirtual: true })
		await nextTick()

		await rerender({ items: [ROWS[0]] })

		expect(container.querySelector('.base-list__item-leave-active')).toBeNull()
		expect(container.querySelectorAll('li')).toHaveLength(container.querySelectorAll('[data-list-id]').length)
	})
})
