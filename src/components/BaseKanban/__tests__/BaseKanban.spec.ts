import '@testing-library/jest-dom/vitest'
import { setLocale } from '@/locales/state'
import BaseKanban from '../ui/BaseKanban.vue'
import type { KanbanCard, KanbanColumn } from '../types/BaseKanban.types'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'

const COLUMNS: KanbanColumn[] = [
	{ id: 'todo', title: 'План' },
	{ id: 'doing', title: 'В работе', limit: 1 },
	{ id: 'done', title: 'Готово' },
]

const CARDS: KanbanCard[] = [
	{ id: 'a', columnId: 'todo', title: 'Альфа', description: 'Описание', tags: ['дизайн'] },
	{ id: 'b', columnId: 'todo', title: 'Бета' },
	{ id: 'c', columnId: 'doing', title: 'Гамма' },
]

const card = (name: string) => screen.getByRole('button', { name })

describe('BaseKanban', () => {
	afterEach(() => setLocale('ru'))

	it('колонки со счётчиками и доступными именами списков, одна точка Tab на доске', () => {
		const { container } = render(BaseKanban, { props: { columns: COLUMNS, cards: CARDS } })

		expect(screen.getByRole('group', { name: 'Доска задач' })).toBeInTheDocument()
		expect(screen.getByRole('list', { name: 'План, 2 карточки' })).toBeInTheDocument()
		expect(screen.getByRole('list', { name: 'В работе, 1 карточка, Лимит 1' })).toBeInTheDocument()
		expect(screen.getByRole('list', { name: 'Готово, 0 карточек' })).toBeInTheDocument()
		expect(container.querySelector('[data-column-id="done"] .base-kanban__empty')).toHaveTextContent('Нет карточек')
		expect(container.querySelector('[data-column-id="doing"] .base-kanban__count')).toHaveTextContent('1 / 1')
		expect(card('Альфа')).toHaveAttribute('tabindex', '0')
		expect(card('Бета')).toHaveAttribute('tabindex', '-1')
		expect(card('Альфа')).toHaveAccessibleDescription('Space — взять карточку, стрелки — перейти к соседней, Enter — открыть')
		expect(card('Альфа')).toHaveTextContent('АльфаОписаниедизайн')
	})

	it('сверх WIP-лимита — подсветка и «Превышен лимит»', () => {
		const { container } = render(BaseKanban, {
			props: { columns: COLUMNS, cards: [...CARDS, { id: 'd', columnId: 'doing', title: 'Дельта' }] },
		})

		expect(screen.getByRole('list', { name: 'В работе, 2 карточки, Превышен лимит 1' })).toBeInTheDocument()
		expect(container.querySelector('[data-column-id="doing"]')).toHaveClass('base-kanban__column--over')
	})

	it('стрелки переводят фокус между карточками и колонками, пропуская пустые', async () => {
		render(BaseKanban, {
			props: {
				columns: [...COLUMNS, { id: 'extra', title: 'Ещё' }],
				cards: [...CARDS, { id: 'e', columnId: 'extra', title: 'Эпсилон' }],
			},
		})

		card('Альфа').focus()
		await fireEvent.keyDown(card('Альфа'), { key: 'ArrowDown' })
		await waitFor(() => expect(card('Бета')).toHaveFocus())
		expect(card('Бета')).toHaveAttribute('tabindex', '0')
		await fireEvent.keyDown(card('Бета'), { key: 'ArrowRight' })
		await waitFor(() => expect(card('Гамма')).toHaveFocus())
		await fireEvent.keyDown(card('Гамма'), { key: 'ArrowRight' })
		await waitFor(() => expect(card('Эпсилон')).toHaveFocus())
		await fireEvent.keyDown(card('Эпсилон'), { key: 'ArrowRight' })
		await fireEvent.keyDown(card('Эпсилон'), { key: 'ArrowLeft' })
		await waitFor(() => expect(card('Гамма')).toHaveFocus())
		await fireEvent.keyDown(card('Гамма'), { key: 'ArrowLeft' })
		await fireEvent.keyDown(card('Альфа'), { key: 'End' })
		await waitFor(() => expect(card('Бета')).toHaveFocus())
		await fireEvent.keyDown(card('Бета'), { key: 'Home' })
		await waitFor(() => expect(card('Альфа')).toHaveFocus())
		await fireEvent.keyDown(card('Альфа'), { key: 'ArrowUp' })
		await fireEvent.keyDown(card('Альфа'), { key: 'x' })
		await fireEvent.keyDown(card('Альфа'), { key: 'ArrowDown', isComposing: true })
		expect(card('Альфа')).toHaveFocus()
	})

	it('Space берёт, стрелки двигают, Space кладёт: update:cards, move и объявления', async () => {
		const { emitted } = render(BaseKanban, { props: { columns: COLUMNS, cards: CARDS } })
		const status = screen.getByRole('status')

		card('Бета').focus()
		await fireEvent.keyDown(card('Бета'), { key: ' ' })
		expect(card('Бета')).toHaveAttribute('aria-pressed', 'true')
		expect(status).toHaveTextContent('Карточка «Бета» взята. Стрелки перемещают её, Space кладёт, Escape отменяет')
		await fireEvent.keyDown(card('Бета'), { key: 'ArrowUp' })
		expect(status).toHaveTextContent('«План», позиция 1 из 2')
		await fireEvent.keyDown(card('Бета'), { key: 'ArrowUp' })
		await fireEvent.keyDown(card('Бета'), { key: 'ArrowRight' })
		await fireEvent.keyDown(card('Бета'), { key: 'ArrowRight' })
		expect(status).toHaveTextContent('«Готово», позиция 1 из 1')
		await fireEvent.keyDown(card('Бета'), { key: 'ArrowRight' })
		await fireEvent.keyDown(card('Бета'), { key: 'ArrowDown' })
		await fireEvent.keyDown(card('Бета'), { key: 'q' })
		await fireEvent.keyDown(card('Бета'), { key: 'Enter' })
		expect(status).toHaveTextContent('Карточка «Бета» положена в «Готово», позиция 1 из 1')
		expect(emitted('update:cards')).toEqual([[[CARDS[0], CARDS[2], { ...CARDS[1], columnId: 'done' }]]])
		expect(emitted('move')).toEqual([[{ card: CARDS[1], from: { columnId: 'todo', index: 1 }, to: { columnId: 'done', index: 0 } }]])
		expect(card('Бета')).not.toHaveAttribute('aria-pressed')
		await waitFor(() => expect(card('Бета')).toHaveFocus())
	})

	it('Escape и Tab отменяют перенос; положить на прежнее место — без событий', async () => {
		const { emitted } = render(BaseKanban, { props: { columns: COLUMNS, cards: CARDS } })

		card('Альфа').focus()
		await fireEvent.keyDown(card('Альфа'), { key: ' ' })
		await fireEvent.keyDown(card('Альфа'), { key: 'ArrowRight' })
		await fireEvent.keyDown(card('Альфа'), { key: 'Escape' })
		expect(screen.getByRole('status')).toHaveTextContent('Перемещение отменено, карточка «Альфа» на прежнем месте')
		expect(screen.getByRole('list', { name: /^План/ })).toContainElement(card('Альфа'))
		await fireEvent.keyDown(card('Альфа'), { key: ' ' })
		await fireEvent.keyDown(card('Альфа'), { key: 'ArrowDown' })
		await fireEvent.keyDown(card('Альфа'), { key: 'Tab' })
		expect(screen.getByRole('list', { name: /^План/ }).firstElementChild).toContainElement(card('Альфа'))
		await fireEvent.keyDown(card('Альфа'), { key: ' ' })
		await fireEvent.keyDown(card('Альфа'), { key: ' ' })
		expect(emitted('update:cards')).toBeUndefined()
		expect(emitted('move')).toBeUndefined()
	})

	it('can-move запрещает место: карточка возвращается, объявление «нельзя положить»', async () => {
		const canMove = vi.fn(() => false)
		const { emitted } = render(BaseKanban, { props: { columns: COLUMNS, cards: CARDS, canMove } })

		card('Альфа').focus()
		await fireEvent.keyDown(card('Альфа'), { key: ' ' })
		await fireEvent.keyDown(card('Альфа'), { key: 'ArrowRight' })
		await fireEvent.keyDown(card('Альфа'), { key: ' ' })
		expect(canMove).toHaveBeenCalledWith({ card: CARDS[0], from: { columnId: 'todo', index: 0 }, to: { columnId: 'doing', index: 0 } })
		expect(screen.getByRole('status')).toHaveTextContent('Карточку «Альфа» нельзя положить в «В работе»')
		expect(emitted('move')).toBeUndefined()
		expect(screen.getByRole('list', { name: /^План/ })).toContainElement(card('Альфа'))
	})

	it('Enter и клик открывают карточку; без v-model карточки остаются на новом месте', async () => {
		const { emitted } = render(BaseKanban, { props: { columns: COLUMNS, cards: CARDS } })

		await fireEvent.keyDown(card('Гамма'), { key: 'Enter' })
		await fireEvent.click(card('Альфа'))
		expect(emitted('open')).toEqual([[CARDS[2]], [CARDS[0]]])
		card('Гамма').focus()
		await fireEvent.keyDown(card('Гамма'), { key: ' ' })
		await fireEvent.keyDown(card('Гамма'), { key: 'ArrowLeft' })
		await fireEvent.keyDown(card('Гамма'), { key: ' ' })
		expect(screen.getByRole('list', { name: 'План, 3 карточки' })).toContainElement(card('Гамма'))
	})

	it('is-disabled: без захвата и открытия, навигация остаётся', async () => {
		const { emitted, container } = render(BaseKanban, { props: { columns: COLUMNS, cards: CARDS, isDisabled: true } })

		expect(card('Альфа')).toHaveAttribute('aria-disabled', 'true')
		expect(container.querySelector('.base-kanban')).toHaveClass('base-kanban--disabled')
		card('Альфа').focus()
		await fireEvent.keyDown(card('Альфа'), { key: ' ' })
		await fireEvent.keyDown(card('Альфа'), { key: 'Enter' })
		await fireEvent.click(card('Альфа'))
		expect(card('Альфа')).not.toHaveAttribute('aria-pressed')
		expect(emitted('open')).toBeUndefined()
		await fireEvent.keyDown(card('Альфа'), { key: 'ArrowDown' })
		await waitFor(() => expect(card('Бета')).toHaveFocus())
	})

	it('v-model снаружи и язык', async () => {
		const { rerender } = render(BaseKanban, { props: { columns: COLUMNS, cards: CARDS } })

		await rerender({ cards: CARDS.slice(0, 1) })
		expect(screen.getAllByRole('button')).toHaveLength(1)
		await rerender({ cards: undefined })
		expect(screen.queryAllByRole('button')).toHaveLength(0)
		setLocale('en')
		await rerender({ cards: CARDS })
		expect(screen.getByRole('list', { name: 'План, 2 cards' })).toBeInTheDocument()
	})

	it('слоты card и column-footer, вариант, масштаб и customClass', () => {
		const { container } = render(BaseKanban, {
			props: {
				columns: COLUMNS,
				cards: CARDS,
				variant: 'outline',
				sizeScale: 125,
				customClass: { root: 'r', column: 'col', card: 'c' },
			},
			slots: {
				card: '<template #card="{ card, isDragging }">{{ card.title }}!{{ isDragging }}</template>',
				'column-footer': '<template #column-footer="{ column, cards }">{{ column.id }}:{{ cards.length }}</template>',
			},
		})
		const root = container.querySelector('.base-kanban') as HTMLElement

		expect(card('Альфа')).toHaveTextContent('Альфа!false')
		expect(container.querySelector('[data-column-id="todo"]')).toHaveTextContent('todo:2')
		expect(root).toHaveClass('base-kanban--outline', 'r')
		expect(root.style.getPropertyValue('--size-scale')).toBe('1.25')
		expect(container.querySelector('.base-kanban__column')).toHaveClass('col')
		expect(card('Альфа')).toHaveClass('c')
	})
})

describe('BaseKanban: меню карточки', () => {
	const menuItem = (name: RegExp | string) => screen.getByRole('menuitem', { name })

	it('правый клик по карточке открывает меню; «Открыть» — событие open', async () => {
		const { emitted } = render(BaseKanban, { props: { columns: COLUMNS, cards: CARDS } })

		await fireEvent.contextMenu(card('Бета'), { clientX: 10, clientY: 10 })
		expect(await screen.findByRole('menu', { name: 'Действия с карточкой' })).toBeInTheDocument()
		expect(menuItem('В начало колонки')).not.toHaveAttribute('aria-disabled')
		expect(menuItem('В конец колонки')).toHaveAttribute('aria-disabled', 'true')
		await fireEvent.click(menuItem('Открыть'))
		expect(emitted('open')).toEqual([[CARDS[1]]])
	})

	it('правый клик мимо карточки меню не открывает', async () => {
		const { container } = render(BaseKanban, { props: { columns: COLUMNS, cards: CARDS } })
		const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true })

		;(container.querySelector('.base-kanban__header') as HTMLElement).dispatchEvent(event)
		expect(event.defaultPrevented).toBe(false)
		expect(screen.queryByRole('menu')).toBeNull()
	})

	it('Shift+F10 на карточке открывает меню; «В начало колонки» переносит с объявлением', async () => {
		const { emitted } = render(BaseKanban, { props: { columns: COLUMNS, cards: CARDS } })

		card('Бета').focus()
		await fireEvent.keyDown(card('Бета'), { key: 'F10', shiftKey: true })
		await fireEvent.click(await screen.findByRole('menuitem', { name: 'В начало колонки' }))
		expect(emitted('move')).toEqual([[{ card: CARDS[1], from: { columnId: 'todo', index: 1 }, to: { columnId: 'todo', index: 0 } }]])
		expect(screen.getByRole('status')).toHaveTextContent('Карточка «Бета» положена в «План», позиция 1 из 2')
		await waitFor(() => expect(card('Бета')).toHaveFocus())
	})

	it('«Переместить в» — подменю колонок; запрещённые can-move места неактивны; пункты приложения', async () => {
		const remove = vi.fn()
		const canMove = vi.fn(({ to }) => to.columnId !== 'done')
		const { emitted } = render(BaseKanban, {
			props: { columns: COLUMNS, cards: CARDS, canMove, cardActions: () => [{ label: 'Удалить', isDanger: true, onSelect: remove }] },
		})

		await fireEvent.keyDown(card('Альфа'), { key: 'ContextMenu' })
		await fireEvent.click(await screen.findByRole('menuitem', { name: 'Удалить' }))
		expect(remove).toHaveBeenCalledOnce()
		await fireEvent.contextMenu(card('Альфа'))
		await fireEvent.click(await screen.findByRole('menuitem', { name: /Переместить в/ }))
		expect(await screen.findByRole('menuitem', { name: 'Готово' })).toHaveAttribute('aria-disabled', 'true')
		await fireEvent.click(screen.getByRole('menuitem', { name: 'В работе' }))
		expect(emitted('move')).toEqual([[{ card: CARDS[0], from: { columnId: 'todo', index: 0 }, to: { columnId: 'doing', index: 1 } }]])
	})

	it('в единственной колонке «Переместить в» неактивно; is-disabled — меню браузера', async () => {
		const { rerender } = render(BaseKanban, { props: { columns: COLUMNS.slice(0, 1), cards: CARDS.slice(0, 1) } })

		await fireEvent.contextMenu(card('Альфа'))
		expect(await screen.findByRole('menuitem', { name: /Переместить в/ })).toHaveAttribute('aria-disabled', 'true')
		await fireEvent.keyDown(document.activeElement as Element, { key: 'Escape' })
		await rerender({ isDisabled: true })
		const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true })
		card('Альфа').dispatchEvent(event)
		expect(event.defaultPrevented).toBe(false)
	})
})
