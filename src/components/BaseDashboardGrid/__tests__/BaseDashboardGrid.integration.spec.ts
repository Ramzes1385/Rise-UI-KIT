import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import BaseDashboardGrid from '../ui/BaseDashboardGrid.vue'
import { fireEvent, render, screen } from '@testing-library/vue'
import type { DashboardLayoutItem } from '../types/BaseDashboardGrid.types'
import { GRID_PROPS, lastCall, makeLayout, mockGridWidth, mockPointerCapture, pointer } from './dashboardGrid.test-utils'

const itemOf = (container: Element, id: string): HTMLElement => container.querySelector(`[data-item-id="${id}"]`) as HTMLElement
const part = (container: Element, id: string, name: string): HTMLElement => itemOf(container, id).querySelector(name) as HTMLElement

function renderGrid(props: Record<string, unknown> = {}) {
	const onLayout = vi.fn()
	const onChange = vi.fn()
	const result = render(BaseDashboardGrid, {
		props: { ...GRID_PROPS, isEditable: true, layout: makeLayout(), 'onUpdate:layout': onLayout, onChange, ...props },
	})
	return { ...result, onLayout, onChange }
}

describe('BaseDashboardGrid клавиатура', () => {
	beforeEach(() => mockGridWidth(400))
	afterEach(() => vi.restoreAllMocks())

	it('Enter берёт виджет, стрелки двигают, Enter кладёт: объявления, update:layout и change', async () => {
		const { container, onLayout, onChange } = renderGrid()
		const widget = itemOf(container, 'a')

		await fireEvent.keyDown(widget, { key: 'Enter' })
		expect(screen.getByRole('status')).toHaveTextContent('Виджет «Выручка» взят.')
		expect(widget).toHaveClass('base-dashboard-grid__item--grabbed')

		await fireEvent.keyDown(widget, { key: 'ArrowRight' })
		expect(screen.getByRole('status')).toHaveTextContent('«Выручка»: колонка 2, строка 1, ширина 2, высота 2')
		expect(itemOf(container, 'b').style.transform).toBe('translate3d(200px, 200px, 0)')
		expect(onLayout).not.toHaveBeenCalled()

		await fireEvent.keyDown(widget, { key: 'Enter' })
		expect(screen.getByRole('status')).toHaveTextContent('Виджет «Выручка» положен: колонка 2, строка 1, ширина 2, высота 2')
		expect(widget).not.toHaveClass('base-dashboard-grid__item--grabbed')
		expect(lastCall(onLayout)).toMatchObject([
			{ id: 'a', x: 1 },
			{ id: 'b', y: 2 },
		])
		expect(lastCall(onChange)).toMatchObject({ id: 'a', action: 'move', breakpoint: 'lg' })
	})

	it('Space тоже берёт и кладёт; все стрелки двигают', async () => {
		const { container, onChange } = renderGrid({ layout: [{ id: 'a', x: 1, y: 1, w: 1, h: 1, label: 'Выручка' }], compactType: 'none' })
		const widget = itemOf(container, 'a')

		await fireEvent.keyDown(widget, { key: ' ' })
		for (const key of ['ArrowLeft', 'ArrowDown', 'ArrowUp', 'ArrowRight']) await fireEvent.keyDown(widget, { key })
		await fireEvent.keyDown(widget, { key: 'ArrowDown' })
		await fireEvent.keyDown(widget, { key: ' ' })

		expect(lastCall(onChange)).toMatchObject({ action: 'move', layout: [{ x: 1, y: 2 }] })
	})

	it('Shift со стрелками меняет размер, событие — resize', async () => {
		const { container, onChange } = renderGrid()
		const widget = itemOf(container, 'a')

		await fireEvent.keyDown(widget, { key: 'Enter' })
		await fireEvent.keyDown(widget, { key: 'ArrowRight', shiftKey: true })
		expect(screen.getByRole('status')).toHaveTextContent('ширина 3')
		await fireEvent.keyDown(widget, { key: 'Enter' })

		expect(lastCall(onChange)).toMatchObject({
			id: 'a',
			action: 'resize',
			layout: [
				{ id: 'a', w: 3 },
				{ id: 'b', y: 2 },
			],
		})
	})

	it('Escape отменяет: ничего не отправляется, виджеты на местах', async () => {
		const { container, onLayout } = renderGrid()
		const widget = itemOf(container, 'a')

		await fireEvent.keyDown(widget, { key: 'Enter' })
		await fireEvent.keyDown(widget, { key: 'ArrowRight' })
		await fireEvent.keyDown(widget, { key: 'Escape' })

		expect(screen.getByRole('status')).toHaveTextContent('Перемещение отменено, виджет «Выручка» на прежнем месте')
		expect(itemOf(container, 'b').style.transform).toBe('translate3d(200px, 0px, 0)')
		expect(widget).not.toHaveClass('base-dashboard-grid__item--grabbed')
		expect(onLayout).not.toHaveBeenCalled()
	})

	it('если положение не изменилось, событий нет, но объявление есть', async () => {
		const { container, onChange } = renderGrid()
		const widget = itemOf(container, 'a')

		await fireEvent.keyDown(widget, { key: 'Enter' })
		await fireEvent.keyDown(widget, { key: 'Enter' })

		expect(onChange).not.toHaveBeenCalled()
		expect(screen.getByRole('status')).toHaveTextContent('положен')
	})

	it('остальные клавиши игнорируются: до взятия и во время', async () => {
		const { container } = renderGrid()
		const widget = itemOf(container, 'a')

		await fireEvent.keyDown(widget, { key: 'ArrowRight' })
		expect(screen.getByRole('status')).toBeEmptyDOMElement()

		await fireEvent.keyDown(widget, { key: 'Enter' })
		await fireEvent.keyDown(widget, { key: 'x' })
		expect(screen.getByRole('status')).toHaveTextContent('взят')
		expect(widget).toHaveClass('base-dashboard-grid__item--grabbed')
	})

	it('закреплённый виджет, вложенное поле и режим без редактирования клавиатуру не включают', async () => {
		const layout: DashboardLayoutItem[] = [
			{ id: 's', x: 0, y: 0, w: 2, h: 1, isStatic: true },
			{ id: 'a', x: 2, y: 0, w: 2, h: 1 },
		]
		const { container, rerender } = render(BaseDashboardGrid, {
			props: { ...GRID_PROPS, isEditable: true, layout },
			slots: { item: '<template #item="{ item }"><input :aria-label="item.id" /></template>' },
		})

		await fireEvent.keyDown(itemOf(container, 's'), { key: 'Enter' })
		await fireEvent.keyDown(screen.getByLabelText('a'), { key: 'Enter' })
		expect(screen.getByRole('status')).toBeEmptyDOMElement()

		await rerender({ isEditable: false })
		await fireEvent.keyDown(itemOf(container, 'a'), { key: 'Enter' })
		expect(screen.getByRole('status')).toBeEmptyDOMElement()
	})

	it('уход фокуса с взятого виджета отменяет перемещение, фокус внутрь виджета — нет', async () => {
		const { container, onLayout } = renderGrid()
		const widget = itemOf(container, 'a')

		await fireEvent.focusOut(widget, { relatedTarget: document.body })
		expect(screen.getByRole('status')).toBeEmptyDOMElement()

		await fireEvent.keyDown(widget, { key: 'Enter' })
		await fireEvent.focusOut(widget, { relatedTarget: part(container, 'a', '.base-dashboard-grid__body') })
		expect(widget).toHaveClass('base-dashboard-grid__item--grabbed')

		await fireEvent.focusOut(itemOf(container, 'b'), { relatedTarget: document.body })
		expect(widget).toHaveClass('base-dashboard-grid__item--grabbed')

		await fireEvent.focusOut(widget, { relatedTarget: document.body })
		expect(widget).not.toHaveClass('base-dashboard-grid__item--grabbed')
		expect(screen.getByRole('status')).toHaveTextContent('Перемещение отменено')
		expect(onLayout).not.toHaveBeenCalled()
	})

	it('отключение сетки во время перемещения сбрасывает его', async () => {
		const { container, rerender } = renderGrid()

		await fireEvent.keyDown(itemOf(container, 'a'), { key: 'Enter' })
		await fireEvent.keyDown(itemOf(container, 'a'), { key: 'ArrowRight' })
		await rerender({ isDisabled: true })

		expect(itemOf(container, 'a')).not.toHaveClass('base-dashboard-grid__item--grabbed')
		expect(itemOf(container, 'b').style.transform).toBe('translate3d(200px, 0px, 0)')
	})

	it('замена layout во время перемещения не ломает клавиатуру', async () => {
		const { container, rerender, onLayout } = renderGrid()
		const widget = itemOf(container, 'a')

		await fireEvent.keyDown(widget, { key: 'Enter' })
		await rerender({ layout: makeLayout() })
		await fireEvent.keyDown(widget, { key: 'ArrowRight' })
		await fireEvent.keyDown(widget, { key: 'Enter' })

		expect(lastCall(onLayout)).toMatchObject([
			{ id: 'a', x: 1 },
			{ id: 'b', y: 2 },
		])
	})

	it('с layouts отправляет update:layouts с заменой текущей раскладки', async () => {
		const onLayouts = vi.fn()
		const md = [{ id: 'm', x: 0, y: 0, w: 1, h: 1 }]
		mockGridWidth(1200)
		const { container, onChange } = renderGrid({
			layout: undefined,
			layouts: { lg: makeLayout(), md },
			'onUpdate:layouts': onLayouts,
		})

		await fireEvent.keyDown(itemOf(container, 'a'), { key: 'Enter' })
		await fireEvent.keyDown(itemOf(container, 'a'), { key: 'ArrowRight' })
		await fireEvent.keyDown(itemOf(container, 'a'), { key: 'Enter' })

		expect(lastCall(onLayouts).md).toEqual(md)
		expect(lastCall(onLayouts).lg).toMatchObject([{ id: 'a', x: 1 }, { id: 'b' }])
		expect(lastCall(onChange)).toMatchObject({ breakpoint: 'lg', layouts: { md } })
	})
})

describe('BaseDashboardGrid указатель', () => {
	let capture: ReturnType<typeof mockPointerCapture>

	beforeEach(() => {
		mockGridWidth(400)
		capture = mockPointerCapture()
	})
	afterEach(() => vi.restoreAllMocks())

	it('перенос за карточку: призрак места, перестройка соседей и итоговое событие', async () => {
		const { container, onLayout, onChange } = renderGrid()
		const widget = itemOf(container, 'a')

		await fireEvent.pointerDown(widget, pointer(10, 10))
		expect(capture).toHaveBeenCalledWith(1)
		await fireEvent.pointerMove(widget, pointer(210, 10))

		expect(container.querySelector('.base-dashboard-grid')).toHaveClass('base-dashboard-grid--dragging')
		expect(widget).toHaveClass('base-dashboard-grid__item--dragging')
		expect(widget.style.transform).toBe('translate3d(200px, 0px, 0)')
		expect(itemOf(container, 'b').style.transform).toBe('translate3d(200px, 200px, 0)')
		const placeholder = container.querySelector('.base-dashboard-grid__placeholder') as HTMLElement
		expect(placeholder.style.transform).toBe('translate3d(200px, 0px, 0)')
		expect(onLayout).not.toHaveBeenCalled()

		await fireEvent.pointerUp(widget, pointer(210, 10))
		expect(container.querySelector('.base-dashboard-grid__placeholder')).toBeNull()
		expect(widget).not.toHaveClass('base-dashboard-grid__item--dragging')
		expect(lastCall(onLayout)).toMatchObject([
			{ id: 'a', x: 2, y: 0 },
			{ id: 'b', y: 2 },
		])
		expect(lastCall(onChange)).toMatchObject({ id: 'a', action: 'move' })
	})

	describe('автопрокрутка у края', () => {
		let scrolledY: number
		let scrollBy: ReturnType<typeof vi.fn>

		beforeEach(() => {
			vi.useFakeTimers()
			scrolledY = 0
			scrollBy = vi.fn((_x: number, dy: number) => {
				scrolledY += dy
			})
			vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(600)
			vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(800)
			vi.spyOn(window, 'scrollY', 'get').mockImplementation(() => scrolledY)
			window.scrollBy = scrollBy as unknown as typeof window.scrollBy
		})
		afterEach(() => vi.useRealTimers())

		it('указатель у нижнего края окна прокручивает его, а виджет едет за указателем', async () => {
			const { container } = renderGrid()
			const widget = itemOf(container, 'a')

			await fireEvent.pointerDown(widget, pointer(210, 590))
			await fireEvent.pointerMove(widget, pointer(210, 600))
			vi.advanceTimersToNextFrame()
			vi.advanceTimersToNextFrame()
			vi.advanceTimersToNextFrame()
			await nextTick()

			expect(scrollBy).toHaveBeenCalledTimes(3)
			expect(widget.style.transform).toBe('translate3d(0px, 82px, 0)')
		})

		it('после pointerup и pointercancel прокрутка останавливается', async () => {
			const { container } = renderGrid()
			const widget = itemOf(container, 'a')

			await fireEvent.pointerDown(widget, pointer(210, 600))
			vi.advanceTimersToNextFrame()
			await fireEvent.pointerUp(widget, pointer(210, 600))
			vi.advanceTimersToNextFrame()
			await fireEvent.pointerDown(widget, pointer(210, 600))
			vi.advanceTimersToNextFrame()
			await fireEvent.pointerCancel(widget, pointer(210, 600))
			vi.advanceTimersToNextFrame()

			expect(scrollBy).toHaveBeenCalledTimes(2)
		})

		it('в середине окна не прокручивает', async () => {
			const { container } = renderGrid()

			await fireEvent.pointerDown(itemOf(container, 'a'), pointer(210, 300))
			vi.advanceTimersToNextFrame()

			expect(scrollBy).not.toHaveBeenCalled()
		})
	})

	it('если виджет вернулся на то же место, события нет', async () => {
		const { container, onChange } = renderGrid()
		const widget = itemOf(container, 'a')

		await fireEvent.pointerDown(widget, pointer(10, 10))
		await fireEvent.pointerMove(widget, pointer(10, 210))
		await fireEvent.pointerUp(widget, pointer(10, 210))
		await fireEvent.pointerDown(widget, pointer(10, 10))
		await fireEvent.pointerUp(widget, pointer(10, 10))

		expect(onChange).not.toHaveBeenCalled()
		expect(widget.style.transform).toBe('translate3d(0px, 0px, 0)')
	})

	it('изменение размера за уголок не начинает перенос', async () => {
		const { container, onChange } = renderGrid()
		const corner = part(container, 'a', '[data-resize]')

		await fireEvent.pointerDown(corner, pointer(200, 200))
		expect(capture).toHaveBeenCalledOnce()
		await fireEvent.pointerMove(corner, pointer(300, 200))
		expect(itemOf(container, 'a').style.width).toBe('300px')
		await fireEvent.pointerMove(corner, pointer(-999, -999))
		expect(itemOf(container, 'a').style.width).toBe('100px')
		await fireEvent.pointerMove(corner, pointer(300, 200))
		await fireEvent.pointerUp(corner, pointer(300, 200))

		expect(lastCall(onChange)).toMatchObject({
			id: 'a',
			action: 'resize',
			layout: [
				{ id: 'a', w: 3, h: 2 },
				{ id: 'b', y: 2 },
			],
		})
	})

	it('мышь без левой кнопки, вложенная кнопка и закреплённый виджет перенос не начинают', async () => {
		const layout: DashboardLayoutItem[] = [
			{ id: 's', x: 0, y: 0, w: 2, h: 1, isStatic: true },
			{ id: 'a', x: 2, y: 0, w: 2, h: 1 },
		]
		const { container } = render(BaseDashboardGrid, {
			props: { ...GRID_PROPS, isEditable: true, layout },
			slots: { item: '<template #item="{ item }"><button type="button">{{ item.id }}!</button></template>' },
		})

		await fireEvent.pointerDown(itemOf(container, 'a'), { ...pointer(10, 10), button: 2 })
		await fireEvent.pointerDown(screen.getByText('a!'), pointer(10, 10))
		await fireEvent.pointerDown(itemOf(container, 's'), pointer(10, 10))
		await fireEvent.pointerDown(part(container, 'a', '[data-handle]'), pointer(10, 10))

		expect(capture).toHaveBeenCalledTimes(1)
	})

	it('касание переносит только за ручку', async () => {
		const { container, onChange } = renderGrid()

		await fireEvent.pointerDown(itemOf(container, 'a'), pointer(10, 10, { pointerType: 'touch' }))
		expect(capture).not.toHaveBeenCalled()

		const handle = part(container, 'a', '[data-handle]')
		await fireEvent.pointerDown(handle, pointer(10, 10, { pointerType: 'touch' }))
		await fireEvent.pointerMove(handle, pointer(210, 10, { pointerType: 'touch' }))
		await fireEvent.pointerUp(handle, pointer(210, 10, { pointerType: 'touch' }))

		expect(capture).toHaveBeenCalledOnce()
		expect(lastCall(onChange)).toMatchObject({ action: 'move' })
	})

	it('чужой указатель и события без переноса игнорируются', async () => {
		const { container, onChange } = renderGrid()
		const widget = itemOf(container, 'a')

		await fireEvent.pointerMove(widget, pointer(50, 50))
		await fireEvent.pointerUp(widget, pointer(50, 50))
		await fireEvent.pointerCancel(widget, pointer(50, 50))

		await fireEvent.pointerDown(widget, pointer(10, 10))
		await fireEvent.pointerDown(itemOf(container, 'b'), pointer(210, 10, { pointerId: 2 }))
		await fireEvent.pointerMove(widget, pointer(210, 10, { pointerId: 2 }))
		await fireEvent.pointerUp(widget, pointer(210, 10, { pointerId: 2 }))
		await fireEvent.pointerCancel(widget, pointer(210, 10, { pointerId: 2 }))

		expect(capture).toHaveBeenCalledOnce()
		expect(widget).toHaveClass('base-dashboard-grid__item--dragging')
		await fireEvent.pointerUp(widget, pointer(10, 10))
		expect(onChange).not.toHaveBeenCalled()
	})

	it('pointercancel и потеря захвата откатывают перенос', async () => {
		const { container, onLayout } = renderGrid()
		const widget = itemOf(container, 'a')

		await fireEvent.pointerDown(widget, pointer(10, 10))
		await fireEvent.pointerMove(widget, pointer(210, 10))
		await fireEvent.pointerCancel(widget, pointer(210, 10))
		expect(widget).not.toHaveClass('base-dashboard-grid__item--dragging')
		expect(itemOf(container, 'b').style.transform).toBe('translate3d(200px, 0px, 0)')

		await fireEvent.pointerDown(widget, pointer(10, 10))
		await fireEvent.pointerMove(widget, pointer(210, 10))
		await fireEvent.lostPointerCapture(widget, pointer(210, 10))
		expect(widget).not.toHaveClass('base-dashboard-grid__item--dragging')
		expect(onLayout).not.toHaveBeenCalled()
	})

	it('Escape отменяет перенос, другие клавиши во время переноса не действуют', async () => {
		const { container, onLayout } = renderGrid()
		const widget = itemOf(container, 'a')

		await fireEvent.pointerDown(widget, pointer(10, 10))
		await fireEvent.pointerMove(widget, pointer(210, 10))
		await fireEvent.keyDown(widget, { key: 'Enter' })
		expect(widget).toHaveClass('base-dashboard-grid__item--dragging')
		expect(screen.getByRole('status')).toBeEmptyDOMElement()

		await fireEvent.keyDown(widget, { key: 'Escape' })
		expect(widget).not.toHaveClass('base-dashboard-grid__item--dragging')
		await fireEvent.pointerUp(widget, pointer(210, 10))
		expect(onLayout).not.toHaveBeenCalled()
	})

	it('выключение редактирования во время переноса отменяет его', async () => {
		const { container, rerender } = renderGrid()
		const widget = itemOf(container, 'a')

		await fireEvent.pointerDown(widget, pointer(10, 10))
		await fireEvent.pointerMove(widget, pointer(210, 10))
		await rerender({ isEditable: false })

		expect(container.querySelector('.base-dashboard-grid')).not.toHaveClass('base-dashboard-grid--dragging')
		expect(itemOf(container, 'b').style.transform).toBe('translate3d(200px, 0px, 0)')
	})

	it('после повторного включения редактирования перенос работает', async () => {
		const { container, rerender, onChange } = renderGrid()

		await rerender({ isEditable: false })
		await rerender({ isEditable: true })
		await fireEvent.pointerDown(itemOf(container, 'a'), pointer(10, 10))
		await fireEvent.pointerMove(itemOf(container, 'a'), pointer(210, 10))
		await fireEvent.pointerUp(itemOf(container, 'a'), pointer(210, 10))

		expect(onChange).toHaveBeenCalledOnce()
	})

	it('без режима редактирования и при isDisabled перенос не начинается', async () => {
		const { container, rerender } = renderGrid({ isEditable: false })

		await fireEvent.pointerDown(itemOf(container, 'a'), pointer(10, 10))
		await rerender({ isEditable: true, isDisabled: true })
		await fireEvent.pointerDown(itemOf(container, 'a'), pointer(10, 10))

		expect(capture).not.toHaveBeenCalled()
	})
})
