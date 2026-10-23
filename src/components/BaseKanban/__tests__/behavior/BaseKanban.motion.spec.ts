import '@testing-library/jest-dom/vitest'
import BaseKanban from '../../ui/BaseKanban.vue'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import type { KanbanCard, KanbanColumn } from '../../types/BaseKanban.types'

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
		const inFlow = [...(item.parentElement as HTMLElement).children].filter(
			child => !child.classList.contains('base-kanban__item-leave-active'),
		)
		return rect([COLUMN_LEFT[column], 40 + inFlow.indexOf(item) * 50, 100, 40])
	})
}

const pointer = (type: string, [x, y]: number[]) =>
	new PointerEvent(type, { bubbles: true, clientX: x, clientY: y, button: 0, pointerType: 'mouse' })

const card = (name: string) => screen.getByRole('button', { name })

const global = { stubs: { Transition: false, TransitionGroup: false } }

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

	it('перенос с клавиатуры: карточки плавно сдвигаются, высота колонок не анимируется, время — из токенов', async () => {
		render(BaseKanban, { props: { columns: COLUMNS, cards: CARDS }, global })

		card('Альфа').focus()
		await fireEvent.keyDown(card('Альфа'), { key: ' ' })
		await fireEvent.keyDown(card('Альфа'), { key: 'ArrowRight' })
		const moves = animate.mock.calls.map(([frames]) => (frames as Keyframe[])[0])
		expect(moves).toContainEqual({ transform: 'translate(-110px, 0px)' })
		expect(moves).toContainEqual({ transform: 'translate(0px, 50px)' })
		expect(moves.some(frame => 'height' in frame)).toBe(false)
		expect(animate.mock.calls[0][1]).toEqual({ duration: 200, easing: expect.stringMatching(/^cubic-bezier\(0\.2, ?0, ?0, ?1\)$/) })
	})

	it('пресет движения none: перенос без анимации', async () => {
		document.documentElement.setAttribute('data-rise-motion', 'none')
		render(BaseKanban, { props: { columns: COLUMNS, cards: CARDS }, global })

		card('Альфа').focus()
		await fireEvent.keyDown(card('Альфа'), { key: ' ' })
		await fireEvent.keyDown(card('Альфа'), { key: 'ArrowDown' })
		document.documentElement.removeAttribute('data-rise-motion')
		expect(animate).not.toHaveBeenCalled()
	})

	it('при «уменьшить движение» анимаций нет', async () => {
		vi.stubGlobal(
			'matchMedia',
			vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
		)
		render(BaseKanban, { props: { columns: COLUMNS, cards: CARDS }, global })

		card('Альфа').focus()
		await fireEvent.keyDown(card('Альфа'), { key: ' ' })
		await fireEvent.keyDown(card('Альфа'), { key: 'ArrowDown' })
		expect(animate).not.toHaveBeenCalled()
	})

	it('отпущенная копия долетает до места карточки и исчезает после анимации', async () => {
		render(BaseKanban, { props: { columns: COLUMNS, cards: CARDS }, global })

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

	it('новая карточка появляется через классы перехода, без WAAPI-появления', async () => {
		render(BaseKanban, { props: { columns: COLUMNS, cards: CARDS, isEditable: true, createCardId: () => 'n' }, global })

		await fireEvent.click(screen.getAllByRole('button', { name: 'Добавить карточку' })[1])
		await fireEvent.update(screen.getByRole('textbox'), 'Новая')
		animate.mockClear()
		await fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' })
		const item = card('Новая').closest('li') as HTMLElement

		expect(item).toHaveClass('base-kanban__item', 'base-kanban__item-enter-active')
		expect(item).not.toHaveClass('base-kanban__item--moved')
		expect(animate.mock.contexts).not.toContain(card('Новая'))
		await waitFor(() => expect(item).not.toHaveClass('base-kanban__item-enter-active'))
	})

	it('удалённая карточка уходит на своём месте: вне потока, без data-атрибутов и id, скрыта от скринридера', async () => {
		const { container, rerender } = render(BaseKanban, { props: { columns: COLUMNS, cards: CARDS }, global })

		await rerender({ cards: [CARDS[1]] })
		const leaving = container.querySelector<HTMLElement>('.base-kanban__item-leave-active') as HTMLElement

		expect(leaving).toHaveTextContent('Альфа')
		expect(leaving).toHaveAttribute('aria-hidden', 'true')
		expect(leaving).toHaveAttribute('inert')
		expect(leaving).not.toHaveClass('base-kanban__item--moved')
		expect(leaving.querySelector('[data-card-id]')).toBeNull()
		expect(leaving.querySelector('[id]')).toBeNull()
		expect(leaving.style.top).toBe('0px')
		expect(leaving.style.width).toBe('0px')
		expect(screen.getAllByRole('button', { name: /Альфа|Бета/ }).map(element => element.dataset.cardId)).toEqual(['b'])
		await waitFor(() => expect(container.querySelectorAll('li')).toHaveLength(1))
	})

	it('карточка, перенесённая в другую колонку, не исчезает и не проявляется: её переносит FLIP', async () => {
		const { container, rerender } = render(BaseKanban, { props: { columns: COLUMNS, cards: CARDS }, global })

		await rerender({ cards: [CARDS[1], { ...CARDS[0], columnId: 'done' }] })
		const leaving = container.querySelector<HTMLElement>('.base-kanban__item-leave-active') as HTMLElement
		const entered = card('Альфа').closest('li') as HTMLElement

		expect(leaving).toHaveClass('base-kanban__item--moved')
		expect(leaving.querySelector('[data-card-id]')).toBeNull()
		expect(entered).toHaveClass('base-kanban__item--moved')
		expect(screen.getByRole('list', { name: /^Готово/ })).toContainElement(card('Альфа'))
		await waitFor(() => expect(entered).not.toHaveClass('base-kanban__item--moved'))
		expect(container.querySelectorAll('li')).toHaveLength(2)
	})

	it('карточка, скрытая фильтром, уходит как удалённая', async () => {
		const { container, rerender } = render(BaseKanban, { props: { columns: COLUMNS, cards: CARDS }, global })

		await rerender({ filter: (item: KanbanCard) => item.id !== 'a' })
		const leaving = container.querySelector<HTMLElement>('.base-kanban__item-leave-active') as HTMLElement

		expect(leaving).toHaveTextContent('Альфа')
		expect(leaving).not.toHaveClass('base-kanban__item--moved')
	})
})
