/**
 * Unit-тесты BaseScrollArea: полосы по размерам области, прокрутка, клик по полосе, перетаскивание ползунка,
 * tabindex и имя области, методы.
 */

import '@testing-library/jest-dom/vitest'
import { ref } from 'vue'
import { fireEvent, render } from '@testing-library/vue'
import BaseScrollArea from '../ui/BaseScrollArea.vue'
import type { BaseScrollAreaExpose } from '../model/BaseScrollArea.types'

interface Size {
	clientHeight?: number
	scrollHeight?: number
	clientWidth?: number
	scrollWidth?: number
}

function setSize(element: HTMLElement, size: Size): void {
	for (const [key, value] of Object.entries(size)) Object.defineProperty(element, key, { value, configurable: true })
}

function setup(
	props: Record<string, unknown> = {},
	size: Size = { clientHeight: 100, scrollHeight: 400, clientWidth: 200, scrollWidth: 200 },
) {
	const api = ref<BaseScrollAreaExpose | null>(null)
	const result = render({
		components: { BaseScrollArea },
		setup: () => ({ api, props }),
		template: '<BaseScrollArea ref="api" v-bind="props" @scroll="$emit(\'scroll\', $event)"><p>Длинный текст</p></BaseScrollArea>',
		emits: ['scroll'],
	})
	const viewport = result.container.querySelector('.base-scroll-area__viewport') as HTMLElement
	setSize(viewport, size)
	;(api.value as BaseScrollAreaExpose).update()
	return { ...result, viewport, api: api.value as BaseScrollAreaExpose }
}

function thumb(container: Element, axis: 'x' | 'y'): HTMLElement {
	return container.querySelector(`.base-scroll-area__bar--${axis} .base-scroll-area__thumb`) as HTMLElement
}

describe('BaseScrollArea unit', () => {
	afterEach(() => vi.useRealTimers())

	it('без переполнения полос нет и область не в порядке Tab', () => {
		const { container, viewport } = setup({}, { clientHeight: 100, scrollHeight: 100, clientWidth: 100, scrollWidth: 100 })
		expect(container.querySelector('.base-scroll-area__bar')).not.toBeInTheDocument()
		expect(viewport).not.toHaveAttribute('tabindex')
	})

	it('вертикальная полоса: длина ползунка по доле видимого, область получает tabindex', async () => {
		const { container, viewport } = setup()
		await Promise.resolve()
		expect(viewport).toHaveAttribute('tabindex', '0')
		expect(container.querySelector('.base-scroll-area__bar--x')).not.toBeInTheDocument()
		expect(container.querySelector('.base-scroll-area__bar--y')).toHaveAttribute('aria-hidden', 'true')
		expect(thumb(container, 'y')).toHaveStyle({ height: '25%', top: '0%' })
	})

	it('прокрутка сдвигает ползунок, показывает полосы и отдаёт событие scroll', async () => {
		vi.useFakeTimers()
		const { container, viewport, emitted } = setup()
		viewport.scrollTop = 150
		await fireEvent.scroll(viewport)
		expect(thumb(container, 'y')).toHaveStyle({ top: '37.5%' })
		expect(container.querySelector('.base-scroll-area')).toHaveClass('base-scroll-area--active')
		await fireEvent.scroll(viewport)
		expect(emitted().scroll).toHaveLength(2)
		await vi.advanceTimersByTimeAsync(800)
		expect(container.querySelector('.base-scroll-area')).not.toHaveClass('base-scroll-area--active')
	})

	it('короткий ползунок не меньше 20px', async () => {
		const { container } = setup({}, { clientHeight: 100, scrollHeight: 100000, clientWidth: 100, scrollWidth: 100 })
		await Promise.resolve()
		expect(thumb(container, 'y')).toHaveStyle({ height: '20%' })
	})

	it('горизонтальная и двусторонняя прокрутка', async () => {
		const size = { clientHeight: 100, scrollHeight: 300, clientWidth: 100, scrollWidth: 400 }
		const horizontal = setup({ orientation: 'horizontal' }, size)
		await Promise.resolve()
		expect(horizontal.container.querySelector('.base-scroll-area__bar--y')).not.toBeInTheDocument()
		expect(thumb(horizontal.container, 'x')).toHaveStyle({ width: '25%', left: '0%' })
		horizontal.unmount()
		const both = setup({ orientation: 'both' }, size)
		await Promise.resolve()
		expect(both.container.querySelectorAll('.base-scroll-area__bar')).toHaveLength(2)
	})

	it('клик по полосе ставит ползунок серединой под указатель', async () => {
		const { container, viewport } = setup(
			{ orientation: 'both' },
			{ clientHeight: 100, scrollHeight: 400, clientWidth: 100, scrollWidth: 400 },
		)
		await Promise.resolve()
		const barY = container.querySelector('.base-scroll-area__bar--y') as HTMLElement
		const barX = container.querySelector('.base-scroll-area__bar--x') as HTMLElement
		barY.getBoundingClientRect = () => ({ top: 0, left: 0, width: 10, height: 100 }) as DOMRect
		barX.getBoundingClientRect = () => ({ top: 0, left: 0, width: 100, height: 10 }) as DOMRect
		await fireEvent.pointerDown(barY, { clientY: 50 })
		await fireEvent.pointerDown(barX, { clientX: 25 })
		expect(viewport.scrollTop).toBe(150)
		expect(viewport.scrollLeft).toBe(50)
		barY.getBoundingClientRect = () => ({ top: 0, left: 0, width: 0, height: 0 }) as DOMRect
		await fireEvent.pointerDown(barY, { clientY: 80 })
		expect(viewport.scrollTop).toBe(150)
	})

	it('перетаскивание ползунка прокручивает пропорционально его свободному ходу', async () => {
		const { container, viewport } = setup(
			{ orientation: 'both' },
			{ clientHeight: 100, scrollHeight: 400, clientWidth: 100, scrollWidth: 200 },
		)
		await Promise.resolve()
		const thumbY = thumb(container, 'y')
		await fireEvent.pointerMove(thumbY, { clientY: 10 })
		await fireEvent.pointerDown(thumbY, { button: 2, clientY: 0 })
		await fireEvent.pointerMove(thumbY, { clientY: 10 })
		expect(viewport.scrollTop).toBe(0)
		await fireEvent.pointerDown(thumbY, { button: 0, clientY: 0, pointerId: 1 })
		expect(container.querySelector('.base-scroll-area')).toHaveClass('base-scroll-area--active')
		// Ход ползунка 75px на 300px прокрутки: 30px указателя — 120px
		await fireEvent.pointerMove(thumbY, { clientY: 30 })
		expect(viewport.scrollTop).toBe(120)
		await fireEvent.pointerUp(thumbY)
		const thumbX = thumb(container, 'x')
		await fireEvent.pointerDown(thumbX, { button: 0, clientX: 0 })
		// Ход 50px на 100px прокрутки: 10px указателя — 20px
		await fireEvent.pointerMove(thumbX, { clientX: 10 })
		await fireEvent.pointerCancel(thumbX)
		expect(viewport.scrollLeft).toBe(20)
	})

	it('ползунок во всю полосу не двигает прокрутку', async () => {
		const { container, viewport } = setup({}, { clientHeight: 10, scrollHeight: 100, clientWidth: 10, scrollWidth: 10 })
		await Promise.resolve()
		const thumbY = thumb(container, 'y')
		await fireEvent.pointerDown(thumbY, { button: 0, clientY: 0 })
		await fireEvent.pointerMove(thumbY, { clientY: 5 })
		expect(viewport.scrollTop).toBe(0)
	})

	it('ariaLabel делает область ориентиром, maxHeight ограничивает высоту', () => {
		const { viewport, unmount } = setup({ ariaLabel: 'Журнал', maxHeight: 240, scrollbar: 'always' })
		expect(viewport).toHaveAttribute('role', 'region')
		expect(viewport).toHaveAccessibleName('Журнал')
		expect(viewport).toHaveStyle({ maxHeight: '240px' })
		expect(viewport.closest('.base-scroll-area')).toHaveClass('base-scroll-area--scrollbar-always')
		unmount()
		const other = setup({ maxHeight: '50vh' })
		expect(other.viewport).toHaveStyle({ maxHeight: '50vh' })
		expect(other.viewport).not.toHaveAttribute('role')
	})

	it('методы прокрутки и getViewport', () => {
		const { viewport, api } = setup()
		viewport.scrollTo = vi.fn()
		api.scrollTo({ top: 40 })
		api.scrollToTop()
		api.scrollToBottom()
		expect(viewport.scrollTo).toHaveBeenNthCalledWith(1, { top: 40 })
		expect(viewport.scrollTo).toHaveBeenNthCalledWith(2, { top: 0 })
		expect(viewport.scrollTo).toHaveBeenNthCalledWith(3, { top: 400 })
		expect(api.getViewport()).toBe(viewport)
	})
})
