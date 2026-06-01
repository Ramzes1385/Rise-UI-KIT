import '@testing-library/jest-dom/vitest'

import { render } from '@testing-library/vue'
import type { Ref } from 'vue'
import { defineComponent, h, shallowRef } from 'vue'

import { useClickOutside } from './useClickOutside'

/** Создать тестовый компонент с useClickOutside */
function createTestComponent(options: {
	targets: Ref<HTMLElement | null>[]
	callback: () => void
	isActive?: () => boolean
	isCapture?: boolean
}) {
	return defineComponent({
		setup() {
			useClickOutside({
				targets: options.targets,
				callback: options.callback,
				isActive: options.isActive,
				isCapture: options.isCapture,
			})
			return () => h('div')
		},
	})
}

/** Извлечь обработчик mousedown, зарегистрированный на document */
function extractHandler(spy: ReturnType<typeof vi.spyOn>): ((e: MouseEvent) => void) | undefined {
	const call = spy.mock.calls.find((c: unknown[]) => c[0] === 'mousedown')
	return call?.[1] as ((e: MouseEvent) => void) | undefined
}

describe('useClickOutside', () => {
	const callback = vi.fn<() => void>()
	let targetRef: Ref<HTMLElement | null>

	beforeEach(() => {
		callback.mockClear()
		targetRef = shallowRef<HTMLElement | null>(null)
	})

	it('должен вызвать callback при клике вне элемента', () => {
		const targetEl = document.createElement('div')
		targetRef.value = targetEl

		render(
			createTestComponent({
				targets: [targetRef],
				callback,
			}),
		)

		document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))

		expect(callback).toHaveBeenCalledTimes(1)
	})

	it('не должен вызвать callback при клике внутри элемента', () => {
		const targetEl = document.createElement('div')
		targetRef.value = targetEl

		const addSpy = vi.spyOn(document, 'addEventListener')
		render(
			createTestComponent({
				targets: [targetRef],
				callback,
			}),
		)
		const handler = extractHandler(addSpy)
		addSpy.mockRestore()

		handler!({ target: targetEl } as unknown as MouseEvent)

		expect(callback).not.toHaveBeenCalled()
	})

	it('не должен вызвать callback когда isActive возвращает false', () => {
		const targetEl = document.createElement('div')
		targetRef.value = targetEl

		const addSpy = vi.spyOn(document, 'addEventListener')
		render(
			createTestComponent({
				targets: [targetRef],
				callback,
				isActive: () => false,
			}),
		)
		const handler = extractHandler(addSpy)
		addSpy.mockRestore()

		handler!({ target: document.body } as unknown as MouseEvent)

		expect(callback).not.toHaveBeenCalled()
	})

	it('должен отписаться от слушателя при размонтировании', () => {
		const targetEl = document.createElement('div')
		targetRef.value = targetEl

		const { unmount } = render(
			createTestComponent({
				targets: [targetRef],
				callback,
			}),
		)

		unmount()

		document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))

		expect(callback).not.toHaveBeenCalled()
	})

	it('должен работать с несколькими targets — клик внутри второго', () => {
		const targetEl1 = document.createElement('div')
		const targetEl2 = document.createElement('div')
		const ref1: Ref<HTMLElement | null> = shallowRef(targetEl1)
		const ref2: Ref<HTMLElement | null> = shallowRef(targetEl2)

		const addSpy = vi.spyOn(document, 'addEventListener')
		render(
			createTestComponent({
				targets: [ref1, ref2],
				callback,
			}),
		)
		const handler = extractHandler(addSpy)
		addSpy.mockRestore()

		handler!({ target: targetEl2 } as unknown as MouseEvent)

		expect(callback).not.toHaveBeenCalled()
	})

	it('должен вызвать callback при клике вне когда несколько targets', () => {
		const targetEl1 = document.createElement('div')
		const targetEl2 = document.createElement('div')
		const ref1: Ref<HTMLElement | null> = shallowRef(targetEl1)
		const ref2: Ref<HTMLElement | null> = shallowRef(targetEl2)

		render(
			createTestComponent({
				targets: [ref1, ref2],
				callback,
			}),
		)

		document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))

		expect(callback).toHaveBeenCalledTimes(1)
	})

	it('должен вызвать callback когда targetRef равен null', () => {
		targetRef.value = null

		render(
			createTestComponent({
				targets: [targetRef],
				callback,
			}),
		)

		document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))

		expect(callback).toHaveBeenCalledTimes(1)
	})

	it('должен вызвать callback когда isActive возвращает true', () => {
		const targetEl = document.createElement('div')
		targetRef.value = targetEl

		const addSpy = vi.spyOn(document, 'addEventListener')
		render(
			createTestComponent({
				targets: [targetRef],
				callback,
				isActive: () => true,
			}),
		)
		const handler = extractHandler(addSpy)
		addSpy.mockRestore()

		handler!({ target: document.body } as unknown as MouseEvent)

		expect(callback).toHaveBeenCalledTimes(1)
	})

	it('должен корректно обрабатывать массив элементов в ref', () => {
		const targetEl1 = document.createElement('div')
		const targetEl2 = document.createElement('div')
		const arrayRef: Ref<HTMLElement[] | null> = shallowRef([targetEl1, targetEl2])

		const addSpy = vi.spyOn(document, 'addEventListener')
		render(
			createTestComponent({
				targets: [arrayRef as unknown as Ref<HTMLElement | null>],
				callback,
			}),
		)
		const handler = extractHandler(addSpy)
		addSpy.mockRestore()

		// Клик внутри второго элемента массива — callback НЕ должен вызваться
		handler!({ target: targetEl2 } as unknown as MouseEvent)
		expect(callback).not.toHaveBeenCalled()
	})

	it('должен корректно обрабатывать массив с null-элементами', () => {
		const targetEl = document.createElement('div')
		const arrayRef: Ref<(HTMLElement | null)[] | null> = shallowRef([null, targetEl, null])

		const addSpy = vi.spyOn(document, 'addEventListener')
		render(
			createTestComponent({
				targets: [arrayRef as unknown as Ref<HTMLElement | null>],
				callback,
			}),
		)
		const handler = extractHandler(addSpy)
		addSpy.mockRestore()

		// Клик внутри второго (не-null) элемента — callback не вызовется
		handler!({ target: targetEl } as unknown as MouseEvent)
		expect(callback).not.toHaveBeenCalled()
	})

	it('должен поддерживать Vue-инстанс с $el', () => {
		const targetEl = document.createElement('div')
		// Имитируем Vue-инстанс: объект с $el (как у компонентов через ref)
		const componentInstance = { $el: targetEl }
		const compRef: Ref<{ $el: HTMLElement } | null> = shallowRef(componentInstance)

		const addSpy = vi.spyOn(document, 'addEventListener')
		render(
			createTestComponent({
				targets: [compRef as unknown as Ref<HTMLElement | null>],
				callback,
			}),
		)
		const handler = extractHandler(addSpy)
		addSpy.mockRestore()

		// Клик внутри $el инстанса — callback НЕ должен вызваться
		handler!({ target: targetEl } as unknown as MouseEvent)
		expect(callback).not.toHaveBeenCalled()
	})

	it('должен использовать capture-фазу когда isCapture=true', () => {
		const targetEl = document.createElement('div')
		targetRef.value = targetEl
		const addSpy = vi.spyOn(document, 'addEventListener')
		const removeSpy = vi.spyOn(document, 'removeEventListener')

		const { unmount } = render(
			createTestComponent({
				targets: [targetRef],
				callback,
				isCapture: true,
			}),
		)

		expect(addSpy).toHaveBeenCalledWith('mousedown', expect.any(Function), true)

		unmount()

		expect(removeSpy).toHaveBeenCalledWith('mousedown', expect.any(Function), true)

		addSpy.mockRestore()
		removeSpy.mockRestore()
	})
})
