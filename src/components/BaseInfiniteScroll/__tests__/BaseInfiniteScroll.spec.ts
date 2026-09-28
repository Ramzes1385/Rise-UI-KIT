/**
 * Unit-тесты BaseInfiniteScroll: подгрузка при появлении метки, итоги done (ok, empty, error), режим manual,
 * контейнер прокрутки, reset и load из ref.
 */

import '@testing-library/jest-dom/vitest'
import { nextTick, ref } from 'vue'
import { fireEvent, render, screen } from '@testing-library/vue'
import BaseInfiniteScroll from '../ui/BaseInfiniteScroll.vue'
import type { BaseInfiniteScrollExpose, InfiniteScrollLoadEvent } from '../types/BaseInfiniteScroll.types'

class FakeObserver {
	static instances: FakeObserver[] = []
	observe = vi.fn()
	disconnect = vi.fn()
	callback: (entries: { isIntersecting: boolean }[]) => void
	options: { root?: Element | null; rootMargin?: string }
	constructor(callback: (entries: { isIntersecting: boolean }[]) => void, options: { root?: Element | null; rootMargin?: string }) {
		this.callback = callback
		this.options = options
		FakeObserver.instances.push(this)
	}
}

function lastObserver(): FakeObserver {
	return FakeObserver.instances[FakeObserver.instances.length - 1]
}

function intersect(isIntersecting = true): void {
	lastObserver().callback([{ isIntersecting }])
}

function setup(initialProps: Record<string, unknown> = {}) {
	const api = ref<BaseInfiniteScrollExpose | null>(null)
	const props = ref(initialProps)
	const events: InfiniteScrollLoadEvent[] = []
	const result = render({
		components: { BaseInfiniteScroll },
		setup: () => ({ api, props, onLoad: (event: InfiniteScrollLoadEvent) => events.push(event) }),
		template:
			'<BaseInfiniteScroll ref="api" v-bind="props" @load="onLoad"><ul aria-label="Заказы"><li>Заказ 1</li></ul></BaseInfiniteScroll>',
	})
	const setProps = async (next: Record<string, unknown>) => {
		props.value = next
		await nextTick()
	}
	return { ...result, events, setProps, api: () => api.value as BaseInfiniteScrollExpose }
}

describe('BaseInfiniteScroll unit', () => {
	beforeEach(() => {
		FakeObserver.instances = []
		vi.stubGlobal('IntersectionObserver', FakeObserver)
	})

	afterEach(() => vi.unstubAllGlobals())

	it('метка у края области — событие load; пока грузится, у списка aria-busy', async () => {
		const { container, events } = setup()
		expect(lastObserver().options).toEqual({ root: null, rootMargin: '0px 0px 200px 0px' })
		expect(lastObserver().observe).toHaveBeenCalledWith(container.querySelector('.base-infinite-scroll__sentinel'))
		expect(container.querySelector('.base-infinite-scroll__footer')).toHaveClass('base-infinite-scroll__footer--empty')
		intersect(false)
		expect(events).toHaveLength(0)
		intersect()
		await nextTick()
		expect(events).toHaveLength(1)
		expect(container.querySelector('.base-infinite-scroll')).toHaveAttribute('aria-busy', 'true')
		expect(screen.getByRole('status')).toHaveTextContent('Загрузка...')
		intersect()
		expect(events).toHaveLength(1)
	})

	it('done("ok") снова следит за концом списка; повторный done не действует', async () => {
		const { container, events } = setup()
		intersect()
		events[0].done('ok')
		events[0].done('error')
		await nextTick()
		await nextTick()
		expect(container.querySelector('.base-infinite-scroll')).not.toHaveAttribute('aria-busy')
		expect(screen.getByRole('status')).toHaveTextContent('')
		expect(FakeObserver.instances).toHaveLength(2)
		expect(FakeObserver.instances[0].disconnect).toHaveBeenCalled()
		intersect()
		expect(events).toHaveLength(2)
	})

	it('done("empty") — конец списка, подгрузок больше нет', async () => {
		const { events, api } = setup({ emptyText: 'Это все заказы' })
		intersect()
		events[0].done('empty')
		await nextTick()
		expect(screen.getByRole('status')).toHaveTextContent('Это все заказы')
		intersect()
		api().load()
		expect(events).toHaveLength(1)
	})

	it('done("error") — текст ошибки и кнопка «Повторить»', async () => {
		const { events } = setup()
		intersect()
		events[0].done('error')
		await nextTick()
		expect(screen.getByRole('status')).toHaveTextContent('Не удалось загрузить')
		intersect()
		expect(events).toHaveLength(1)
		await fireEvent.click(screen.getByRole('button', { name: 'Повторить' }))
		expect(events).toHaveLength(2)
	})

	it('режим manual: без наблюдателя, кнопка «Загрузить еще»', async () => {
		const { events } = setup({ mode: 'manual', loadMoreText: 'Показать ещё 20', loadingText: 'Грузим…', errorText: 'Сбой' })
		expect(FakeObserver.instances).toHaveLength(0)
		await fireEvent.click(screen.getByRole('button', { name: 'Показать ещё 20' }))
		expect(screen.getByRole('status')).toHaveTextContent('Грузим…')
		expect(screen.queryByRole('button', { name: 'Показать ещё 20' })).not.toBeInTheDocument()
		events[0].done('error')
		await nextTick()
		expect(screen.getByRole('status')).toHaveTextContent('Сбой')
	})

	it('контейнер прокрутки: селектор, элемент; смена distance пересоздаёт наблюдатель', async () => {
		const list = document.createElement('div')
		list.id = 'feed'
		document.body.append(list)
		const { setProps } = setup({ root: '#feed' })
		expect(lastObserver().options.root).toBe(list)
		await setProps({ root: list, distance: 50 })
		expect(lastObserver().options).toEqual({ root: list, rootMargin: '0px 0px 50px 0px' })
		list.remove()
	})

	it('reset возвращает подгрузку после конца списка', async () => {
		const { events, api } = setup()
		intersect()
		events[0].done('empty')
		api().reset()
		await nextTick()
		intersect()
		expect(events).toHaveLength(2)
	})

	it('без IntersectionObserver (SSR, старые браузеры) работает кнопкой через ref', async () => {
		vi.stubGlobal('IntersectionObserver', undefined)
		const { events, api, unmount } = setup()
		api().load()
		expect(events).toHaveLength(1)
		unmount()
	})
})
