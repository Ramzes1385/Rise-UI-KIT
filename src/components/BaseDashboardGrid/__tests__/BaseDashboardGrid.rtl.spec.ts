import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { fireEvent, render } from '@testing-library/vue'
import BaseDashboardGrid from '../ui/BaseDashboardGrid.vue'
import { GRID_PROPS, makeLayout, mockGridWidth, mockPointerCapture, pointer } from './dashboardGrid.test-utils'

const itemOf = (container: Element, id: string): HTMLElement => container.querySelector(`[data-item-id="${id}"]`) as HTMLElement

describe('BaseDashboardGrid в RTL', () => {
	beforeEach(() => {
		mockGridWidth(400)
		mockPointerCapture()
		document.documentElement.setAttribute('dir', 'rtl')
	})
	afterEach(() => {
		vi.restoreAllMocks()
		document.documentElement.removeAttribute('dir')
	})

	it('сетка отсчитывается от правого края: сдвиг по горизонтали со знаком минус', async () => {
		const { container } = render(BaseDashboardGrid, { props: { ...GRID_PROPS, layout: makeLayout() } })
		await nextTick()

		expect(itemOf(container, 'a').style.transform).toBe('translate3d(0px, 0px, 0)')
		expect(itemOf(container, 'b').style.transform).toBe('translate3d(-200px, 0px, 0)')
	})

	it('← двигает виджет вперёд (к большему номеру колонки), → назад', async () => {
		const { container } = render(BaseDashboardGrid, { props: { ...GRID_PROPS, isEditable: true, layout: makeLayout() } })
		await nextTick()
		const widget = itemOf(container, 'a')

		await fireEvent.keyDown(widget, { key: 'Enter' })
		await fireEvent.keyDown(widget, { key: 'ArrowLeft' })
		expect(widget.style.transform).toBe('translate3d(-100px, 0px, 0)')
		await fireEvent.keyDown(widget, { key: 'ArrowRight' })
		expect(widget.style.transform).toBe('translate3d(0px, 0px, 0)')
	})

	it('перетаскивание влево увеличивает номер колонки', async () => {
		const { container } = render(BaseDashboardGrid, { props: { ...GRID_PROPS, isEditable: true, layout: makeLayout() } })
		await nextTick()
		const widget = itemOf(container, 'a')

		await fireEvent.pointerDown(widget, pointer(300, 50))
		await fireEvent.pointerMove(widget, pointer(200, 50))

		expect(widget.style.transform).toBe('translate3d(-100px, 0px, 0)')
	})
})
