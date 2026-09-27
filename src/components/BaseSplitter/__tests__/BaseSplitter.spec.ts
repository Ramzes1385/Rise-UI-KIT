/**
 * Unit-тесты BaseSplitter: семантика separator, клавиатура (стрелки, Home/End, Enter), перетаскивание, отключение.
 */

import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/vue'
import BaseSplitter from '../ui/BaseSplitter.vue'

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
		expect(container.querySelector('.base-splitter')).toHaveStyle({ '--base-splitter-ratio': '0.5' })
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
		// Корень в jsdom — 100px шириной (мок getBoundingClientRect): указатель на 30px — 30%
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
		// Высота корня в моке — 20px: указатель на 5px — 25%
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
