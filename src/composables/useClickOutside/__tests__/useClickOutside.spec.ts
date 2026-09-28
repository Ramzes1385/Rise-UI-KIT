import '@testing-library/jest-dom/vitest'
import { render } from '@testing-library/vue'
import { defineComponent, h, nextTick, ref, shallowRef } from 'vue'
import { useClickOutside } from '../useClickOutside'
import type { ComponentPublicInstance, Ref } from 'vue'

type Target = HTMLElement | ComponentPublicInstance | (HTMLElement | null)[] | null

/** Тестовый компонент с useClickOutside */
function createTestComponent(options: { targets: Ref<Target>[]; callback: () => void; isActive?: () => boolean; isCapture?: boolean }) {
	return defineComponent({
		setup() {
			useClickOutside(options)
			return () => h('div')
		},
	})
}

function pressAt(target: EventTarget): void {
	target.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
}

/** Элемент в документе: нажатие по нему доходит до слушателей document */
function attached(): HTMLElement {
	const element = document.createElement('div')
	document.body.append(element)
	return element
}

describe('useClickOutside', () => {
	const callback = vi.fn<() => void>()

	beforeEach(() => {
		callback.mockClear()
	})

	it('вызывает callback при нажатии вне элемента и не вызывает внутри', () => {
		const target = attached()
		render(createTestComponent({ targets: [shallowRef<Target>(target)], callback }))

		pressAt(target)
		expect(callback).not.toHaveBeenCalled()

		pressAt(document.body)
		expect(callback).toHaveBeenCalledTimes(1)
	})

	it('цель без элемента — любое нажатие вне', () => {
		render(createTestComponent({ targets: [shallowRef<Target>(null)], callback }))

		pressAt(document.body)
		expect(callback).toHaveBeenCalledTimes(1)
	})

	it('isActive: закрытый слой нажатия не получает', () => {
		const isOpen = ref(false)
		render(createTestComponent({ targets: [shallowRef<Target>(attached())], callback, isActive: () => isOpen.value }))

		pressAt(document.body)
		expect(callback).not.toHaveBeenCalled()

		isOpen.value = true
		pressAt(document.body)
		expect(callback).toHaveBeenCalledTimes(1)
	})

	it('массив элементов и корень компонента', () => {
		const first = attached()
		const second = attached()
		const instanceRoot = attached()
		render(
			createTestComponent({
				targets: [
					shallowRef<Target>([first, null, second]),
					shallowRef<Target>({ $el: instanceRoot } as unknown as ComponentPublicInstance),
				],
				callback,
			}),
		)

		pressAt(second)
		pressAt(instanceRoot)
		expect(callback).not.toHaveBeenCalled()
	})

	it('корень компонента без элемента (текстовый узел) не считается целью', () => {
		render(
			createTestComponent({
				targets: [shallowRef<Target>({ $el: document.createTextNode('') } as unknown as ComponentPublicInstance)],
				callback,
			}),
		)

		pressAt(document.body)
		expect(callback).toHaveBeenCalledTimes(1)
	})

	it('isCapture: срабатывает, даже если элемент остановил всплытие', () => {
		const stopper = attached()
		stopper.addEventListener('mousedown', event => event.stopPropagation())
		const bubbleCallback = vi.fn()
		render(createTestComponent({ targets: [shallowRef<Target>(attached())], callback, isCapture: true }))
		render(createTestComponent({ targets: [shallowRef<Target>(attached())], callback: bubbleCallback }))

		pressAt(stopper)

		expect(callback).toHaveBeenCalledTimes(1)
		expect(bubbleCallback).not.toHaveBeenCalled()
	})

	it('вложенный слой, открытый позже, не закрывает родителя нажатием внутри себя', async () => {
		const parentPanel = attached()
		const childPanel = attached()
		const isChildOpen = ref(false)
		const childCallback = vi.fn()
		render(createTestComponent({ targets: [shallowRef<Target>(parentPanel)], callback }))
		render(
			createTestComponent({ targets: [shallowRef<Target>(childPanel)], callback: childCallback, isActive: () => isChildOpen.value }),
		)

		isChildOpen.value = true
		await nextTick()
		pressAt(childPanel)
		expect(callback).not.toHaveBeenCalled()

		pressAt(parentPanel)
		expect(childCallback).toHaveBeenCalledTimes(1)
		expect(callback).not.toHaveBeenCalled()
	})

	it('после размонтирования нажатия не отслеживаются', () => {
		const { unmount } = render(createTestComponent({ targets: [shallowRef<Target>(attached())], callback }))
		unmount()

		pressAt(document.body)
		expect(callback).not.toHaveBeenCalled()
	})
})
