import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import BaseSplitter from '../ui/BaseSplitter.vue'
import { fireEvent, render, screen } from '@testing-library/vue'

const SLOTS = { start: 'Письма', end: 'Письмо' }

function setup(props: Record<string, unknown> = {}) {
	const result = render(BaseSplitter, { props, slots: SLOTS })
	const separator = screen.getByRole('separator')
	const updates = () => (result.emitted()['update:modelValue'] ?? []).map(args => (args as number[])[0])
	const changes = () => (result.emitted().change ?? []).map(args => (args as number[])[0])
	return { ...result, separator, updates, changes }
}

describe('BaseSplitter unit', () => {
	it('разделитель — separator с размером первой панели', () => {
		const { container, separator } = setup()
		const start = container.querySelector('.base-splitter__pane--start') as HTMLElement
		expect(separator).toHaveAccessibleName('Размер панелей')
		expect(separator).toHaveAttribute('tabindex', '0')
		expect(separator).toHaveAttribute('aria-orientation', 'vertical')
		expect(separator).toHaveAttribute('aria-valuenow', '50')
		expect(separator).toHaveAttribute('aria-valuemin', '10')
		expect(separator).toHaveAttribute('aria-valuemax', '90')
		expect(separator).toHaveAttribute('aria-controls', start.id)
		expect(start).toHaveTextContent('Письма')
		expect(start).toHaveStyle({ '--base-splitter-ratio': '0.5' })
		expect(container.querySelector('.base-splitter__pane--end')).toHaveTextContent('Письмо')
	})

	it('стрелки ←/→ двигают на шаг, Home/End — к границам', async () => {
		const { separator, updates, changes } = setup({ label: 'Список писем' })
		expect(separator).toHaveAccessibleName('Список писем')
		await fireEvent.keyDown(separator, { key: 'ArrowRight' })
		await fireEvent.keyDown(separator, { key: 'ArrowLeft' })
		await fireEvent.keyDown(separator, { key: 'Home' })
		await fireEvent.keyDown(separator, { key: 'End' })
		await fireEvent.keyDown(separator, { key: 'End' })
		await fireEvent.keyDown(separator, { key: 'Tab' })
		expect(updates()).toEqual([55, 50, 10, 90])
		expect(changes()).toEqual([55, 50, 10, 90, 90])
		expect(separator).toHaveAttribute('aria-valuenow', '90')
	})

	it('Enter сворачивает первую панель до минимума и возвращает прежний размер', async () => {
		const { separator, updates } = setup({ modelValue: 40 })
		await fireEvent.keyDown(separator, { key: 'Enter' })
		await fireEvent.keyDown(separator, { key: 'Enter' })
		expect(updates()).toEqual([10, 40])
	})

	it('вертикальное расположение: стрелки ↑/↓', async () => {
		const { container, separator, updates } = setup({ orientation: 'vertical', step: 10 })
		expect(container.querySelector('.base-splitter')).toHaveClass('base-splitter--vertical')
		expect(separator).toHaveAttribute('aria-orientation', 'horizontal')
		await fireEvent.keyDown(separator, { key: 'ArrowDown' })
		await fireEvent.keyDown(separator, { key: 'ArrowUp' })
		await fireEvent.keyDown(separator, { key: 'ArrowRight' })
		expect(updates()).toEqual([60, 50])
	})

	it('v-model снаружи меняет размер', async () => {
		const { separator, rerender } = setup({ modelValue: 30 })
		await rerender({ modelValue: 70 })
		expect(separator).toHaveAttribute('aria-valuenow', '70')
	})

	it('перетаскивание: размер по положению указателя, change при отпускании', async () => {
		const { container, separator, updates, changes } = setup()
		await fireEvent.pointerMove(separator, { clientX: 20 })
		await fireEvent.pointerUp(separator)
		expect(updates()).toEqual([])
		await fireEvent.pointerDown(separator, { button: 0, pointerId: 1 })
		expect(container.querySelector('.base-splitter')).toHaveClass('base-splitter--dragging')
		expect(separator).toHaveFocus()
		await fireEvent.pointerMove(separator, { clientX: 30 })
		await fireEvent.pointerMove(separator, { clientX: 99.5 })
		await fireEvent.pointerUp(separator)
		expect(updates()).toEqual([30, 90])
		expect(changes()).toEqual([90])
		expect(container.querySelector('.base-splitter')).not.toHaveClass('base-splitter--dragging')
	})

	it('вертикальное перетаскивание берёт clientY; нулевой размер корня не меняет размер', async () => {
		const { container, separator, updates } = setup({ orientation: 'vertical' })
		const root = container.querySelector('.base-splitter') as HTMLElement
		await fireEvent.pointerDown(separator, { button: 0 })
		await fireEvent.pointerMove(separator, { clientY: 5 })
		root.getBoundingClientRect = () => ({ width: 0, height: 0, top: 0, left: 0 }) as DOMRect
		await fireEvent.pointerMove(separator, { clientY: 10 })
		await fireEvent.pointerCancel(separator)
		expect(updates()).toEqual([25])
	})

	it('правая кнопка мыши и отключённый разделитель не тащат', async () => {
		const { separator, updates } = setup()
		await fireEvent.pointerDown(separator, { button: 2 })
		await fireEvent.pointerMove(separator, { clientX: 30 })
		expect(updates()).toEqual([])
	})

	it('isDisabled: без фокуса и перетаскивания', async () => {
		const { container, separator, updates } = setup({ isDisabled: true })
		expect(separator).not.toHaveAttribute('tabindex')
		expect(separator).toHaveAttribute('aria-disabled', 'true')
		expect(container.querySelector('.base-splitter')).toHaveClass('base-splitter--disabled')
		await fireEvent.pointerDown(separator, { button: 0 })
		await fireEvent.pointerMove(separator, { clientX: 30 })
		expect(updates()).toEqual([])
	})
})

const PANES = { 'pane-1': 'Папки', 'pane-2': 'Письма', 'pane-3': 'Письмо' }

function setupPanes(props: Record<string, unknown> = {}) {
	const result = render(BaseSplitter, { props: { sizes: [20, 40, 40], ...props }, slots: PANES })
	const separators = screen.getAllByRole('separator')
	const updates = () => (result.emitted()['update:sizes'] ?? []).map(args => (args as number[][])[0])
	const changes = () => (result.emitted()['sizes-change'] ?? []).map(args => (args as number[][])[0])
	return { ...result, separators, updates, changes }
}

describe('BaseSplitter: несколько панелей', () => {
	it('sizes — столько панелей, сколько значений, и разделитель между каждой парой', () => {
		const { container, separators } = setupPanes()
		const panes = [...container.querySelectorAll('.base-splitter__pane')] as HTMLElement[]
		expect(panes.map(pane => pane.textContent?.trim())).toEqual(['Папки', 'Письма', 'Письмо'])
		expect(container.querySelector('.base-splitter')).toHaveStyle({ '--base-splitter-gaps': '2' })
		expect(panes[1]).toHaveStyle({ '--base-splitter-ratio': '0.4' })
		expect(panes[2]).toHaveClass('base-splitter__pane--end')
		expect(separators).toHaveLength(2)
		expect(separators.map(separator => separator.getAttribute('aria-label'))).toEqual(['Размер панелей 1', 'Размер панелей 2'])
		expect(separators[1]).toHaveAttribute('aria-controls', panes[1].id)
		expect(separators[1]).toHaveAttribute('aria-valuenow', '40')
		expect(separators[1]).toHaveAttribute('aria-valuemin', '10')
		expect(separators[1]).toHaveAttribute('aria-valuemax', '70')
		expect(container.querySelector('.base-splitter__pane--start')).toBe(panes[0])
	})

	it('разделитель двигает только границу соседних панелей и держит обе в min…max: Home не растит соседнюю выше max', async () => {
		const { separators, updates, changes } = setupPanes({ paneLabels: ['Папки', 'Список писем'], min: 15, max: 60 })
		expect(separators[0]).toHaveAccessibleName('Папки')
		await fireEvent.keyDown(separators[1], { key: 'ArrowRight' })
		await fireEvent.keyDown(separators[1], { key: 'End' })
		await fireEvent.keyDown(separators[0], { key: 'Home' })
		await fireEvent.keyDown(separators[0], { key: 'Home' })
		expect(updates()).toEqual([
			[20, 45, 35],
			[20, 60, 20],
		])
		expect(separators[0]).toHaveAttribute('aria-valuemin', '20')
		expect(changes()).toHaveLength(4)
		expect(changes()[3]).toEqual([20, 60, 20])
	})

	it('Enter сворачивает панель и возвращает её размер', async () => {
		const { separators, updates } = setupPanes()
		await fireEvent.keyDown(separators[1], { key: 'Enter' })
		await fireEvent.keyDown(separators[1], { key: 'Enter' })
		expect(updates()).toEqual([
			[20, 10, 70],
			[20, 40, 40],
		])
	})

	it('Enter у свёрнутой с самого начала панели разворачивает её до исходного размера', async () => {
		const { separators, updates } = setupPanes({ sizes: [10, 50, 40] })
		await fireEvent.keyDown(separators[0], { key: 'Enter' })
		expect(updates()).toEqual([])
	})

	it('перетаскивание второго разделителя считает от начала корня', async () => {
		const { separators, updates, changes } = setupPanes()
		await fireEvent.pointerDown(separators[1], { button: 0, pointerId: 1 })
		await fireEvent.pointerMove(separators[1], { clientX: 75 })
		await fireEvent.pointerUp(separators[1])
		expect(updates()).toEqual([[20, 55, 25]])
		expect(changes()).toEqual([[20, 55, 25]])
	})

	it('v-model:sizes снаружи меняет размеры', async () => {
		const { separators, rerender } = setupPanes()
		await rerender({ sizes: [30, 30, 40] })
		expect(separators[0]).toHaveAttribute('aria-valuenow', '30')
		expect(separators[1]).toHaveAttribute('aria-valuemax', '60')
	})
})

describe('BaseSplitter: прокрутка панелей', () => {
	it('панель, которая прокручивается по вертикали или горизонтали, получает tabindex', async () => {
		vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockImplementation(function (this: HTMLElement) {
			return this.textContent === 'Письма' ? 500 : 0
		})
		const { container } = render(BaseSplitter, { slots: SLOTS })
		await nextTick()
		expect(container.querySelector('.base-splitter__pane--start')).toHaveAttribute('tabindex', '0')
		expect(container.querySelector('.base-splitter__pane--end')).not.toHaveAttribute('tabindex')
		vi.restoreAllMocks()
	})
})
