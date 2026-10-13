import { mount } from '@vue/test-utils'
import { useTableInfinite } from '../useTableInfinite'
import { defineComponent, h, nextTick, ref } from 'vue'

class FakeIntersectionObserver {
	callback: IntersectionObserverCallback
	options: IntersectionObserverInit | undefined
	observed: Element[] = []
	observe = vi.fn((element: Element) => {
		this.observed.push(element)
	})
	unobserve = vi.fn((element: Element) => {
		this.observed = this.observed.filter(item => item !== element)
	})
	disconnect = vi.fn()

	constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
		this.callback = callback
		this.options = options
		observers.push(this)
	}
}

const observers: FakeIntersectionObserver[] = []

function intersect(observer: FakeIntersectionObserver, isIntersecting: boolean): void {
	observer.callback([{ isIntersecting } as IntersectionObserverEntry], observer as unknown as IntersectionObserver)
}

function mountHost(config: { isActive?: boolean; hasOwnScroll?: boolean } = {}) {
	const state = {
		isActive: ref(config.isActive ?? true),
		hasOwnScroll: ref(config.hasOwnScroll ?? false),
		rows: ref(5),
		onReach: vi.fn(),
	}
	let api!: ReturnType<typeof useTableInfinite>
	const sentinelRef = ref<HTMLElement | null>(null)
	const rootRef = ref<HTMLElement | null>(null)
	const hasSentinel = ref(true)
	const Host = defineComponent({
		setup() {
			api = useTableInfinite({
				sentinelRef,
				rootRef,
				isActive: () => state.isActive.value,
				hasOwnScroll: () => state.hasOwnScroll.value,
				distance: 50,
				onReach: state.onReach,
				rearm: () => state.rows.value,
			})
			return () => h('div', { ref: rootRef }, hasSentinel.value ? [h('div', { ref: sentinelRef, id: 'sentinel' })] : [])
		},
	})
	const wrapper = mount(Host)
	return { wrapper, state, rootRef, hasSentinel, isObserving: () => api.isObserving.value }
}

describe('useTableInfinite', () => {
	beforeEach(() => {
		observers.length = 0
		vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver)
	})
	afterEach(() => {
		vi.unstubAllGlobals()
	})

	it('наблюдает метку с запасом снизу и вызывает onReach, когда она видна', async () => {
		const { wrapper, state, isObserving } = mountHost()
		await nextTick()
		expect(observers).toHaveLength(1)
		expect(observers[0].options).toEqual({ root: null, rootMargin: '0px 0px 50px 0px' })
		expect(observers[0].observed[0]).toBe(wrapper.get('#sentinel').element)
		expect(isObserving()).toBe(true)
		intersect(observers[0], false)
		expect(state.onReach).not.toHaveBeenCalled()
		intersect(observers[0], true)
		expect(state.onReach).toHaveBeenCalledOnce()
		wrapper.unmount()
	})

	it('с собственной прокруткой корень наблюдателя — обёртка', async () => {
		const { wrapper, rootRef } = mountHost({ hasOwnScroll: true })
		await nextTick()
		expect(observers[0].options?.root).toBe(rootRef.value)
		wrapper.unmount()
	})

	it('смена числа строк заново проверяет метку: список, не заполнивший область, дополняется', async () => {
		const { wrapper, state } = mountHost()
		await nextTick()
		state.rows.value = 10
		await nextTick()
		expect(observers[0].unobserve).toHaveBeenCalledOnce()
		expect(observers[0].observe).toHaveBeenCalledTimes(2)
		wrapper.unmount()
	})

	it('без подгрузки наблюдателя нет; включение и выключение создают и снимают его', async () => {
		const { wrapper, state, isObserving } = mountHost({ isActive: false })
		await nextTick()
		expect(observers).toHaveLength(0)
		expect(isObserving()).toBe(false)
		state.rows.value = 6
		await nextTick()
		state.isActive.value = true
		await nextTick()
		expect(observers).toHaveLength(1)
		expect(isObserving()).toBe(true)
		state.isActive.value = false
		await nextTick()
		expect(observers[0].disconnect).toHaveBeenCalled()
		expect(isObserving()).toBe(false)
		wrapper.unmount()
	})

	it('метка исчезла (смена режима) — наблюдатель снят, повторная проверка ничего не делает', async () => {
		const { wrapper, state, hasSentinel, isObserving } = mountHost()
		await nextTick()
		hasSentinel.value = false
		await nextTick()
		expect(isObserving()).toBe(false)
		state.rows.value = 7
		await nextTick()
		expect(observers[0].unobserve).not.toHaveBeenCalled()
		wrapper.unmount()
	})

	it('без IntersectionObserver (SSR, старый браузер) isObserving остаётся false', async () => {
		vi.unstubAllGlobals()
		vi.stubGlobal('IntersectionObserver', undefined)
		const { wrapper, isObserving } = mountHost()
		await nextTick()
		expect(isObserving()).toBe(false)
		wrapper.unmount()
	})

	it('размонтирование отключает наблюдателя', async () => {
		const { wrapper } = mountHost()
		await nextTick()
		wrapper.unmount()
		expect(observers[0].disconnect).toHaveBeenCalled()
	})
})
