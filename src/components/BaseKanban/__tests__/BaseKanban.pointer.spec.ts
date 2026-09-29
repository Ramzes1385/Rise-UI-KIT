import '@testing-library/jest-dom/vitest'
import BaseKanban from '../ui/BaseKanban.vue'
import { fireEvent, render, screen } from '@testing-library/vue'
import type { KanbanCard, KanbanColumn } from '../types/BaseKanban.types'

const COLUMNS: KanbanColumn[] = [
	{ id: 'todo', title: 'План' },
	{ id: 'doing', title: 'В работе' },
	{ id: 'done', title: 'Готово' },
]

const CARDS: KanbanCard[] = [
	{ id: 'a', columnId: 'todo', title: 'Альфа' },
	{ id: 'b', columnId: 'todo', title: 'Бета' },
	{ id: 'c', columnId: 'doing', title: 'Гамма' },
]

const COLUMN_LEFT: Record<string, number> = { todo: 0, doing: 110, done: 220 }

const rect = ([left, top, width, height]: number[]) =>
	({ left, top, width, height, right: left + width, bottom: top + height, x: left, y: top }) as DOMRect

function mockLayout(): void {
	vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
		if (this.dataset.columnId) return rect([COLUMN_LEFT[this.dataset.columnId], 0, 100, 400])
		const item = this.closest('li')
		if (!this.dataset.cardId || !item) return rect([0, 0, 0, 0])
		const column = item.closest<HTMLElement>('[data-column-id]')?.dataset.columnId ?? 'todo'
		return rect([COLUMN_LEFT[column], [...(item.parentElement as HTMLElement).children].indexOf(item) * 50, 100, 40])
	})
}

const pointer = (type: string, [x, y]: number[], init: PointerEventInit = {}) =>
	new PointerEvent(type, { bubbles: true, clientX: x, clientY: y, button: 0, pointerType: 'mouse', ...init })

const card = (name: string) => screen.getByRole('button', { name })

describe('BaseKanban: перетаскивание мышью', () => {
	beforeEach(mockLayout)
	afterEach(() => vi.restoreAllMocks())

	it('карточка поднимается после сдвига, под курсором — копия, на месте — пунктир; отпускание переносит', async () => {
		const { container, emitted } = render(BaseKanban, { props: { columns: COLUMNS, cards: CARDS } })

		card('Бета').dispatchEvent(pointer('pointerdown', [20, 60]))
		window.dispatchEvent(pointer('pointermove', [22, 61]))
		await fireEvent(window, pointer('pointermove', [22, 62]))
		expect(container.querySelector('.base-kanban__ghost')).toBeNull()
		await fireEvent(window, pointer('pointermove', [240, 10]))
		const ghost = container.querySelector('.base-kanban__ghost') as HTMLElement
		expect(ghost).toHaveTextContent('Бета')
		expect(ghost.style.transform).toBe('translate(220px, 0px)')
		expect(ghost.style.width).toBe('100px')
		expect(card('Бета')).toHaveClass('base-kanban__card--placeholder')
		expect(screen.getByRole('list', { name: /^Готово/ })).toContainElement(card('Бета'))
		await fireEvent(window, pointer('pointermove', [150, 10]))
		await fireEvent(window, pointer('pointermove', [150, 10]))
		await fireEvent(window, pointer('pointermove', [105, 10]))
		await fireEvent(window, pointer('pointerup', [150, 10]))
		expect(container.querySelector('.base-kanban__ghost')).toBeNull()
		expect(emitted('move')).toEqual([[{ card: CARDS[1], from: { columnId: 'todo', index: 1 }, to: { columnId: 'doing', index: 0 } }]])
		await fireEvent.click(card('Бета'))
		expect(emitted('open')).toBeUndefined()
		await fireEvent.click(card('Бета'))
		expect(emitted('open')).toEqual([[{ ...CARDS[1], columnId: 'doing' }]])
	})

	it('Escape во время перетаскивания отменяет; клик без сдвига открывает карточку', async () => {
		const { container, emitted } = render(BaseKanban, { props: { columns: COLUMNS, cards: CARDS } })

		card('Альфа').dispatchEvent(pointer('pointerdown', [20, 10]))
		await fireEvent(window, pointer('pointermove', [250, 10]))
		await fireEvent.keyDown(window, { key: 'a' })
		await fireEvent.keyDown(window, { key: 'Escape' })
		expect(container.querySelector('.base-kanban__ghost')).toBeNull()
		expect(screen.getByRole('list', { name: /^План/ })).toContainElement(card('Альфа'))
		expect(screen.getByRole('status')).toHaveTextContent('Перемещение отменено')
		await fireEvent.keyDown(window, { key: 'Escape' })
		card('Альфа').dispatchEvent(pointer('pointerdown', [20, 10]))
		await fireEvent(window, pointer('pointerup', [20, 10]))
		await fireEvent.click(card('Альфа'))
		expect(emitted('open')).toEqual([[CARDS[0]]])
		expect(emitted('move')).toBeUndefined()
	})

	it('правая кнопка, касание и is-disabled не начинают перетаскивание', async () => {
		const { container, rerender } = render(BaseKanban, { props: { columns: COLUMNS, cards: CARDS } })

		card('Альфа').dispatchEvent(pointer('pointerdown', [20, 10], { button: 2 }))
		card('Альфа').dispatchEvent(pointer('pointerdown', [20, 10], { pointerType: 'touch' }))
		await fireEvent(window, pointer('pointermove', [250, 10]))
		expect(container.querySelector('.base-kanban__ghost')).toBeNull()
		await rerender({ isDisabled: true })
		card('Альфа').dispatchEvent(pointer('pointerdown', [20, 10]))
		await fireEvent(window, pointer('pointermove', [250, 10]))
		expect(container.querySelector('.base-kanban__ghost')).toBeNull()
	})
})
