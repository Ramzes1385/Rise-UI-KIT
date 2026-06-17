/**
 * Unit-тесты для useAutoScroll.
 * Проверяют автопрокрутку контейнера к низу.
 */

import { mount } from '@vue/test-utils'
import { nextTick, ref } from 'vue'
import { useAutoScroll } from './useAutoScroll'

/** Обёртка для вызова composable внутри Vue-контекста */
function withSetup<T>(composable: () => T): T {
	let result: T
	mount({
		setup() {
			result = composable()
			return () => null
		},
	})
	return result!
}

describe('useAutoScroll', () => {
	it('должен возвращать scrollToBottom', () => {
		const container = ref<HTMLElement | null>(null)
		const { scrollToBottom } = withSetup(() =>
			useAutoScroll({
				container,
				enabled: () => true,
				watchSource: () => 0,
			}),
		)

		expect(scrollToBottom).toBeTypeOf('function')
	})

	it('должен прокручивать контейнер к низу когда enabled=true', async () => {
		const el = document.createElement('div')
		Object.defineProperty(el, 'scrollHeight', { value: 1000, configurable: true })
		Object.defineProperty(el, 'scrollTop', { value: 0, writable: true, configurable: true })
		const container = ref<HTMLElement | null>(el)

		const { scrollToBottom } = withSetup(() =>
			useAutoScroll({
				container,
				enabled: () => true,
				watchSource: () => 0,
			}),
		)

		scrollToBottom()
		await vi.waitFor(() => {
			expect(el.scrollTop).toBe(1000)
		})
	})

	it('не должен прокручивать когда enabled=false', async () => {
		const el = document.createElement('div')
		Object.defineProperty(el, 'scrollHeight', { value: 1000, configurable: true })
		Object.defineProperty(el, 'scrollTop', { value: 0, writable: true, configurable: true })
		const container = ref<HTMLElement | null>(el)

		const { scrollToBottom } = withSetup(() =>
			useAutoScroll({
				container,
				enabled: () => false,
				watchSource: () => 0,
			}),
		)

		scrollToBottom()
		await vi.waitFor(() => {
			expect(el.scrollTop).toBe(0)
		})
	})

	it('не должен прокручивать когда container=null', () => {
		const container = ref<HTMLElement | null>(null)

		const { scrollToBottom } = withSetup(() =>
			useAutoScroll({
				container,
				enabled: () => true,
				watchSource: () => 0,
			}),
		)

		expect(() => scrollToBottom()).not.toThrow()
	})

	it('должен автопрокручивать при изменении watchSource', async () => {
		const el = document.createElement('div')
		Object.defineProperty(el, 'scrollHeight', { value: 1000, configurable: true })
		Object.defineProperty(el, 'scrollTop', { value: 0, writable: true, configurable: true })
		const container = ref<HTMLElement | null>(el)
		const watchSource = ref(0)

		withSetup(() =>
			useAutoScroll({
				container,
				enabled: () => true,
				watchSource: () => watchSource.value,
			}),
		)

		// Изменяем watchSource — должна произойти автопрокрутка
		watchSource.value = 1
		await vi.waitFor(() => {
			expect(el.scrollTop).toBe(1000)
		})
	})

	it('должен прокручивать при монтировании если enabled=true', async () => {
		const el = document.createElement('div')
		Object.defineProperty(el, 'scrollHeight', { value: 500, configurable: true })
		Object.defineProperty(el, 'scrollTop', { value: 0, writable: true, configurable: true })
		const container = ref<HTMLElement | null>(el)

		withSetup(() =>
			useAutoScroll({
				container,
				enabled: () => true,
				watchSource: () => 0,
			}),
		)

		// onMounted вызывает scrollToBottom
		await vi.waitFor(() => {
			expect(el.scrollTop).toBe(500)
		})
	})

	it('не должен падать если container стал null внутри nextTick', async () => {
		const el = document.createElement('div')
		Object.defineProperty(el, 'scrollHeight', { value: 1000, configurable: true })
		Object.defineProperty(el, 'scrollTop', { value: 0, writable: true, configurable: true })
		const container = ref<HTMLElement | null>(el)

		const { scrollToBottom } = withSetup(() =>
			useAutoScroll({
				container,
				enabled: () => true,
				watchSource: () => 0,
			}),
		)

		scrollToBottom()
		container.value = null // обнуляем до nextTick
		await nextTick()

		expect(el.scrollTop).toBe(0) // не прокрутился
	})
})
