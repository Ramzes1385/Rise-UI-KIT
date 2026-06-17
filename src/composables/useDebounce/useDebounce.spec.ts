import '@testing-library/jest-dom/vitest'
import { render } from '@testing-library/vue'
import { defineComponent, h, nextTick } from 'vue'
import { useDebounce, useDebounceFn } from './useDebounce'

describe('useDebounce', () => {
	beforeEach(() => {
		vi.useFakeTimers()
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	describe('useDebounce', () => {
		it('возвращает начальное значение', () => {
			const TestComponent = defineComponent({
				setup() {
					const debounced = useDebounce('hello', 300)
					return () => h('div', debounced.value)
				},
			})
			const { container } = render(TestComponent)
			expect(container.textContent).toBe('hello')
		})

		it('обновляется с задержкой', async () => {
			const TestComponent = defineComponent({
				setup() {
					const debounced = useDebounce('hello', 300)
					function update() {
						debounced.value = 'world'
					}
					return () => h('div', { onClick: update, id: 'test' }, debounced.value)
				},
			})
			const { container } = render(TestComponent)
			const el = container.querySelector('#test')!

			el.dispatchEvent(new MouseEvent('click'))
			expect(container.textContent).toBe('hello')

			vi.advanceTimersByTime(300)
			await nextTick()
			expect(container.textContent).toBe('world')
		})

		it('перезапускает таймер при повторной записи', async () => {
			let externalSet: (val: string) => void = () => {}
			const TestComponent = defineComponent({
				setup() {
					const debounced = useDebounce('a', 300)
					externalSet = (val: string) => {
						debounced.value = val
					}
					return () => h('div', debounced.value)
				},
			})
			const { container } = render(TestComponent)

			externalSet('b')
			vi.advanceTimersByTime(200)
			externalSet('c')
			vi.advanceTimersByTime(200)
			await nextTick()
			expect(container.textContent).toBe('a')

			vi.advanceTimersByTime(100)
			await nextTick()
			expect(container.textContent).toBe('c')
		})

		it('должен очищать таймер при размонтировании когда таймер активен', () => {
			const TestComponent = defineComponent({
				setup() {
					const debounced = useDebounce('initial', 300)
					debounced.value = 'updated'
					return () => h('div', debounced.value)
				},
			})
			const { unmount, container } = render(TestComponent)
			unmount()
			vi.advanceTimersByTime(300)
			expect(container.querySelector('div')).not.toBeInTheDocument()
		})

		it('должен корректно размонтироваться когда таймер не активен', () => {
			const TestComponent = defineComponent({
				setup() {
					useDebounce('initial', 300)
					return () => h('div')
				},
			})
			const { unmount } = render(TestComponent)
			expect(() => unmount()).not.toThrow()
		})
	})

	describe('useDebounceFn', () => {
		it('вызывает функцию с задержкой', () => {
			const fn = vi.fn()
			let externalCall: (arg: string) => void = () => {}
			const TestComponent = defineComponent({
				setup() {
					const debounced = useDebounceFn(fn, 300)
					externalCall = debounced
					return () => h('div')
				},
			})
			render(TestComponent)
			externalCall('test')
			expect(fn).not.toHaveBeenCalled()
			vi.advanceTimersByTime(300)
			expect(fn).toHaveBeenCalledWith('test')
		})

		it('перезапускает таймер при повторном вызове', () => {
			const fn = vi.fn()
			let externalCall: (arg: string) => void = () => {}
			const TestComponent = defineComponent({
				setup() {
					const debounced = useDebounceFn(fn, 300)
					externalCall = debounced
					return () => h('div')
				},
			})
			render(TestComponent)
			externalCall('a')
			vi.advanceTimersByTime(200)
			externalCall('b')
			vi.advanceTimersByTime(300)
			expect(fn).toHaveBeenCalledWith('b')
			expect(fn).toHaveBeenCalledTimes(1)
		})

		it('должен очищать таймер при размонтировании когда таймер активен', () => {
			const fn = vi.fn()
			const TestComponent = defineComponent({
				setup() {
					const debounced = useDebounceFn(fn, 300)
					debounced('test')
					return () => h('div')
				},
			})
			const { unmount } = render(TestComponent)
			unmount()
			vi.advanceTimersByTime(300)
			expect(fn).not.toHaveBeenCalled()
		})

		it('должен корректно размонтироваться когда таймер не активен', () => {
			const fn = vi.fn()
			const TestComponent = defineComponent({
				setup() {
					useDebounceFn(fn, 300)
					return () => h('div')
				},
			})
			const { unmount } = render(TestComponent)
			expect(() => unmount()).not.toThrow()
		})
	})
})
