import '@testing-library/jest-dom/vitest'
import BaseKanban from '../ui/BaseKanban.vue'
import type { KanbanCard, KanbanColumn } from '../types/BaseKanban.types'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'

const COLUMNS: KanbanColumn[] = [
	{ id: 'todo', title: 'План' },
	{ id: 'doing', title: 'В работе', color: 'rgb(1, 2, 3)' },
	{ id: 'done', title: 'Готово' },
]

const CARDS: KanbanCard[] = [
	{ id: 'a', columnId: 'todo', title: 'Альфа' },
	{ id: 'b', columnId: 'todo', title: 'Бета' },
	{ id: 'c', columnId: 'doing', title: 'Гамма' },
]

const card = (name: string) => screen.getByRole('button', { name })

const addButtons = () => screen.getAllByRole('button', { name: 'Добавить карточку' })

const textbox = (name?: string) => screen.getByRole('textbox', name ? { name } : undefined)

describe('BaseKanban: добавление карточек', () => {
	it('Enter добавляет в конец колонки и оставляет поле для следующей; Escape закрывает', async () => {
		const { emitted } = render(BaseKanban, { props: { columns: COLUMNS, cards: CARDS, isEditable: true, createCardId: () => 'new' } })

		await fireEvent.click(addButtons()[0])
		const field = textbox('Название новой карточки в «План»')
		expect(field).toHaveFocus()
		await fireEvent.update(field, '  Дельта \n новая ')
		await fireEvent.keyDown(field, { key: 'Enter' })
		const created = { id: 'new', columnId: 'todo', title: 'Дельта новая' }
		expect(emitted('create')).toEqual([[created]])
		expect(emitted('update:cards')).toEqual([[[CARDS[0], CARDS[1], created, CARDS[2]]]])
		expect(screen.getByRole('status')).toHaveTextContent('Карточка «Дельта новая» добавлена в «План»')
		expect(field).toHaveValue('')
		expect(field).toHaveFocus()
		await fireEvent.keyDown(field, { key: 'Enter' })
		await fireEvent.keyDown(field, { key: 'Escape', isComposing: true })
		expect(emitted('create')).toHaveLength(1)
		expect(field).toBeInTheDocument()
		await fireEvent.keyDown(field, { key: 'Escape' })
		expect(screen.queryByRole('textbox')).toBeNull()
		await waitFor(() => expect(addButtons()[0]).toHaveFocus())
	})

	it('кнопки «Добавить» и «Отмена»; уход фокуса: пустое поле закрывается, с текстом — остаётся', async () => {
		const { emitted } = render(BaseKanban, { props: { columns: COLUMNS, cards: CARDS, isEditable: true } })

		await fireEvent.click(addButtons()[2])
		expect(screen.queryByText('Нет карточек')).toBeNull()
		const field = textbox('Название новой карточки в «Готово»')
		await fireEvent.update(field, 'Эпсилон')
		const submit = screen.getByRole('button', { name: 'Добавить' })
		const press = new MouseEvent('mousedown', { bubbles: true, cancelable: true })
		submit.dispatchEvent(press)
		expect(press.defaultPrevented).toBe(true)
		await fireEvent.keyDown(submit, { key: 'Enter' })
		expect(emitted('create')).toBeUndefined()
		await fireEvent.click(submit)
		const [[created]] = emitted('create') as KanbanCard[][]
		expect(created.id).toMatch(/^card-[a-z0-9]+-1$/)
		expect(created).toMatchObject({ columnId: 'done', title: 'Эпсилон' })
		await fireEvent.update(field, 'Черновик')
		await fireEvent.focusOut(field, { relatedTarget: submit })
		await fireEvent.focusOut(field, { relatedTarget: document.body })
		expect(field).toBeInTheDocument()
		await fireEvent.update(field, '   ')
		await fireEvent.focusOut(field)
		expect(screen.queryByRole('textbox')).toBeNull()
		await fireEvent.click(addButtons()[1])
		const cancel = screen.getByRole('button', { name: 'Отмена' })
		const cancelPress = new MouseEvent('mousedown', { bubbles: true, cancelable: true })
		cancel.dispatchEvent(cancelPress)
		expect(cancelPress.defaultPrevented).toBe(true)
		await fireEvent.click(cancel)
		expect(screen.queryByRole('textbox')).toBeNull()
	})
})

describe('BaseKanban: переименование и удаление', () => {
	it('F2: Enter сохраняет, Escape отменяет, уход фокуса сохраняет без возврата фокуса', async () => {
		const { emitted } = render(BaseKanban, { props: { columns: COLUMNS, cards: CARDS, isEditable: true } })

		expect(card('Бета')).toHaveAccessibleDescription(/Enter — открыть, F2 — переименовать$/)
		card('Бета').focus()
		await fireEvent.keyDown(card('Бета'), { key: 'F2' })
		expect(textbox('Название карточки')).toHaveValue('Бета')
		expect(textbox('Название карточки')).toHaveFocus()
		await fireEvent.update(textbox(), 'Бета 2')
		await fireEvent.keyDown(textbox(), { key: 'Enter' })
		const renamed = { ...CARDS[1], title: 'Бета 2' }
		expect(emitted('rename')).toEqual([[renamed]])
		expect(emitted('update:cards')).toEqual([[[CARDS[0], renamed, CARDS[2]]]])
		expect(screen.getByRole('status')).toHaveTextContent('Карточка переименована: «Бета 2»')
		await waitFor(() => expect(card('Бета 2')).toHaveFocus())
		await fireEvent.keyDown(card('Бета 2'), { key: 'F2' })
		await fireEvent.update(textbox(), 'Другое')
		await fireEvent.keyDown(textbox(), { key: 'Escape' })
		await waitFor(() => expect(card('Бета 2')).toHaveFocus())
		await fireEvent.keyDown(card('Бета 2'), { key: 'F2' })
		await fireEvent.focusOut(textbox())
		expect(emitted('rename')).toHaveLength(1)
		await fireEvent.keyDown(card('Бета 2'), { key: 'F2' })
		await fireEvent.update(textbox(), 'Бета 3')
		await fireEvent.focusOut(textbox())
		expect(emitted('rename')).toHaveLength(2)
		expect(card('Бета 3')).not.toHaveFocus()
	})

	it('без is-editable, во время переноса и при is-disabled F2 не переименовывает', async () => {
		const { rerender } = render(BaseKanban, { props: { columns: COLUMNS, cards: CARDS } })

		card('Альфа').focus()
		await fireEvent.keyDown(card('Альфа'), { key: 'F2' })
		expect(screen.queryByRole('textbox')).toBeNull()
		expect(screen.queryByRole('button', { name: 'Добавить карточку' })).toBeNull()
		await rerender({ isEditable: true })
		await fireEvent.keyDown(card('Альфа'), { key: ' ' })
		await fireEvent.keyDown(card('Альфа'), { key: 'F2' })
		expect(screen.queryByRole('textbox')).toBeNull()
		await fireEvent.keyDown(card('Альфа'), { key: 'Escape' })
		await rerender({ isDisabled: true })
		await fireEvent.keyDown(card('Альфа'), { key: 'F2' })
		expect(screen.queryByRole('textbox')).toBeNull()
		expect(screen.queryByRole('button', { name: 'Добавить карточку' })).toBeNull()
		expect(card('Альфа')).toHaveAccessibleDescription(/Enter — открыть$/)
	})

	it('меню при is-editable: «Переименовать» и «Удалить»; фокус — на соседнюю карточку или «Добавить карточку»', async () => {
		const { emitted } = render(BaseKanban, { props: { columns: COLUMNS, cards: CARDS, isEditable: true } })

		await fireEvent.contextMenu(card('Альфа'))
		await fireEvent.click(await screen.findByRole('menuitem', { name: 'Переименовать' }))
		expect(textbox('Название карточки')).toHaveValue('Альфа')
		await fireEvent.keyDown(textbox(), { key: 'Escape' })
		await fireEvent.contextMenu(card('Альфа'))
		await fireEvent.click(await screen.findByRole('menuitem', { name: 'Удалить' }))
		expect(emitted('delete')).toEqual([[CARDS[0]]])
		expect(emitted('update:cards')).toEqual([[[CARDS[1], CARDS[2]]]])
		expect(screen.getByRole('status')).toHaveTextContent('Карточка «Альфа» удалена')
		await waitFor(() => expect(card('Бета')).toHaveFocus())
		await fireEvent.contextMenu(card('Гамма'))
		await fireEvent.click(await screen.findByRole('menuitem', { name: 'Удалить' }))
		await waitFor(() => expect(addButtons()[1]).toHaveFocus())
	})
})

describe('BaseKanban: фильтр, свёртывание и цвет колонок', () => {
	const HIDDEN: KanbanCard[] = [
		{ id: 'a', columnId: 'todo', title: 'Альфа' },
		{ id: 'h', columnId: 'todo', title: 'Скрытая' },
		{ id: 'b', columnId: 'todo', title: 'Бета' },
		{ id: 'c', columnId: 'doing', title: 'Гамма' },
	]

	it('filter: счётчик «2 из 3», скрытые карточки сохраняют места, move — по полному списку', async () => {
		const { emitted, container, rerender } = render(BaseKanban, {
			props: { columns: COLUMNS, cards: HIDDEN, filter: (item: KanbanCard) => item.id !== 'h' },
		})

		expect(container.querySelector('[data-column-id="todo"] .base-kanban__count')).toHaveTextContent('2 из 3')
		expect(screen.getByRole('list', { name: 'План, 2 карточки' })).toBeInTheDocument()
		expect(screen.queryByRole('button', { name: 'Скрытая' })).toBeNull()
		card('Бета').focus()
		await fireEvent.keyDown(card('Бета'), { key: ' ' })
		await fireEvent.keyDown(card('Бета'), { key: 'ArrowUp' })
		await fireEvent.keyDown(card('Бета'), { key: ' ' })
		expect(emitted('update:cards')).toEqual([[[HIDDEN[2], HIDDEN[0], HIDDEN[1], HIDDEN[3]]]])
		expect(emitted('move')).toEqual([[{ card: HIDDEN[2], from: { columnId: 'todo', index: 2 }, to: { columnId: 'todo', index: 0 } }]])
		await rerender({ cards: HIDDEN, filter: (item: KanbanCard) => item.id === 'h' })
		expect(container.querySelector('[data-column-id="doing"] .base-kanban__empty')).toHaveTextContent('Ничего не найдено')
		expect(container.querySelector('[data-column-id="done"] .base-kanban__empty')).toHaveTextContent('Нет карточек')
	})

	it('is-collapsible: кнопка сворачивает колонку, стрелки её пропускают, v-model:collapsed-columns', async () => {
		const { emitted, container, rerender } = render(BaseKanban, {
			props: {
				columns: [...COLUMNS, { id: 'extra', title: 'Ещё' }],
				cards: [...CARDS, { id: 'e', columnId: 'extra', title: 'Эпсилон' }],
				isCollapsible: true,
			},
		})
		const doing = container.querySelector('[data-column-id="doing"]') as HTMLElement

		expect(doing).toHaveClass('base-kanban__column--colored')
		expect(doing.style.getPropertyValue('--kanban-column-color')).toBe('rgb(1, 2, 3)')
		expect(doing.querySelector('.base-kanban__dot')).not.toBeNull()
		expect(container.querySelector('[data-column-id="todo"] .base-kanban__dot')).toBeNull()
		expect(screen.getByRole('button', { name: 'Свернуть колонку «В работе»' })).toHaveAttribute('aria-expanded', 'true')
		await fireEvent.click(screen.getByRole('button', { name: 'Свернуть колонку «В работе»' }))
		expect(emitted('update:collapsedColumns')).toEqual([[['doing']]])
		expect(screen.getByRole('button', { name: 'Развернуть колонку «В работе»' })).toHaveAttribute('aria-expanded', 'false')
		expect(doing).toHaveClass('base-kanban__column--collapsed')
		expect(screen.queryByRole('list', { name: /^В работе/ })).toBeNull()
		card('Альфа').focus()
		await fireEvent.keyDown(card('Альфа'), { key: 'ArrowRight' })
		await waitFor(() => expect(card('Эпсилон')).toHaveFocus())
		await fireEvent.click(screen.getByRole('button', { name: 'Развернуть колонку «В работе»' }))
		expect(emitted('update:collapsedColumns')).toEqual([[['doing']], [[]]])
		await rerender({ collapsedColumns: ['extra'] })
		expect(screen.queryByRole('list', { name: /^Ещё/ })).toBeNull()
		expect(card('Альфа')).toHaveAttribute('tabindex', '0')
	})

	it('«Переместить в» свёрнутую колонку: карточка скрыта, фокус — на соседнюю', async () => {
		const { emitted } = render(BaseKanban, { props: { columns: COLUMNS, cards: CARDS, collapsedColumns: ['done'] } })

		expect(screen.queryByRole('button', { name: /колонку/ })).toBeNull()
		await fireEvent.contextMenu(card('Альфа'))
		await fireEvent.click(await screen.findByRole('menuitem', { name: /Переместить в/ }))
		await fireEvent.click(await screen.findByRole('menuitem', { name: 'Готово' }))
		expect(emitted('move')).toEqual([[{ card: CARDS[0], from: { columnId: 'todo', index: 0 }, to: { columnId: 'done', index: 0 } }]])
		expect(screen.queryByRole('button', { name: 'Альфа' })).toBeNull()
		await waitFor(() => expect(card('Бета')).toHaveFocus())
	})
})
