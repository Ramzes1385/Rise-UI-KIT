import '@testing-library/jest-dom/vitest'
import BaseKanban from '../ui/BaseKanban.vue'
import type { KanbanCard, KanbanColumn } from '../types/BaseKanban.types'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'

const COLUMNS: KanbanColumn[] = [
	{ id: 'todo', title: 'План' },
	{ id: 'done', title: 'Готово' },
]

const CARDS: KanbanCard[] = [
	{ id: 'a', columnId: 'todo', title: 'Альфа' },
	{ id: 'b', columnId: 'todo', title: 'Бета' },
]

const COLUMN_LEFT: Record<string, number> = { todo: 0, done: 110 }

const rect = ([left, top, width, height]: number[]) =>
	({ left, top, width, height, right: left + width, bottom: top + height, x: left, y: top }) as DOMRect

function mockLayout(): void {
	vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
		if (this.dataset.columnId) return rect([COLUMN_LEFT[this.dataset.columnId], 0, 100, 40 + this.querySelectorAll('li').length * 50])
		const item = this.closest('li')
		if (!this.dataset.cardId || !item) return rect([0, 0, 0, 0])
		const column = item.closest<HTMLElement>('[data-column-id]')?.dataset.columnId ?? 'todo'
		return rect([COLUMN_LEFT[column], 40 + [...(item.parentElement as HTMLElement).children].indexOf(item) * 50, 100, 40])
	})
}

const pointer = (type: string, [x, y]: number[]) =>
	new PointerEvent(type, { bubbles: true, clientX: x, clientY: y, button: 0, pointerType: 'mouse' })

const card = (name: string) => screen.getByRole('button', { name })

describe('BaseKanban: анимации', () => {
	let animate: ReturnType<typeof vi.fn>

	beforeEach(() => {
		mockLayout()
		animate = vi.fn(() => ({ onfinish: null }))
		HTMLElement.prototype.animate = animate as unknown as HTMLElement['animate']
		vi.stubGlobal(
			'matchMedia',
			vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
		)
	})

	afterEach(() => {
		vi.restoreAllMocks()
		vi.unstubAllGlobals()
		Reflect.deleteProperty(HTMLElement.prototype, 'animate')
	})

	it('перенос с клавиатуры: карточки плавно сдвигаются, высота колонок меняется плавно', async () => {
		render(BaseKanban, { props: { columns: COLUMNS, cards: CARDS } })

		card('Альфа').focus()
		await fireEvent.keyDown(card('Альфа'), { key: ' ' })
		await fireEvent.keyDown(card('Альфа'), { key: 'ArrowRight' })
		const moves = animate.mock.calls.map(([frames]) => (frames as Keyframe[])[0])
		expect(moves).toContainEqual({ transform: 'translate(-110px, 0px)' })
		expect(moves).toContainEqual({ transform: 'translate(0px, 50px)' })
		expect(moves).toContainEqual({ height: '140px' })
		expect(animate.mock.calls[0][1]).toMatchObject({ duration: 220 })
	})

	it('при «уменьшить движение» анимаций нет', async () => {
		vi.stubGlobal(
			'matchMedia',
			vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
		)
		render(BaseKanban, { props: { columns: COLUMNS, cards: CARDS } })

		card('Альфа').focus()
		await fireEvent.keyDown(card('Альфа'), { key: ' ' })
		await fireEvent.keyDown(card('Альфа'), { key: 'ArrowDown' })
		expect(animate).not.toHaveBeenCalled()
	})

	it('отпущенная копия долетает до места карточки и исчезает после анимации', async () => {
		render(BaseKanban, { props: { columns: COLUMNS, cards: CARDS } })

		card('Альфа').dispatchEvent(pointer('pointerdown', [20, 50]))
		await fireEvent(window, pointer('pointermove', [60, 80]))
		await fireEvent(window, pointer('pointermove', [130, 60]))
		const ghost = document.querySelector('.base-kanban__ghost') as HTMLElement
		animate.mockClear()
		await fireEvent(window, pointer('pointerup', [130, 60]))
		await waitFor(() => expect(ghost).toHaveClass('base-kanban__ghost--settling'))
		const settle = animate.mock.results.find((_, index) => animate.mock.contexts[index] === ghost)?.value as Animation
		expect(animate.mock.calls.find((_, index) => animate.mock.contexts[index] === ghost)?.[0]).toEqual([
			{ transform: 'translate(110px, 40px)' },
		])
		expect(document.querySelector('.base-kanban__ghost')).not.toBeNull()
		settle.onfinish?.({} as AnimationPlaybackEvent)
		await waitFor(() => expect(document.querySelector('.base-kanban__ghost')).toBeNull())
	})

	it('новая карточка появляется плавно', async () => {
		render(BaseKanban, { props: { columns: COLUMNS, cards: CARDS, isEditable: true, createCardId: () => 'n' } })

		await fireEvent.click(screen.getAllByRole('button', { name: 'Добавить карточку' })[1])
		await fireEvent.update(screen.getByRole('textbox'), 'Новая')
		animate.mockClear()
		await fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' })
		const index = animate.mock.contexts.indexOf(card('Новая'))
		expect(animate.mock.calls[index][0]).toEqual([
			{ opacity: 0, transform: 'scale(0.96)' },
			{ opacity: 1, transform: 'none' },
		])
	})
})
