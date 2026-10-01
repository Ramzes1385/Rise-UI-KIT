import '@testing-library/jest-dom/vitest'
import BaseKanban from '../ui/BaseKanban.vue'
import type { KanbanCard, KanbanColumn } from '../types/BaseKanban.types'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'

const COLUMNS: KanbanColumn[] = [
	{ id: 'todo', title: 'План' },
	{ id: 'doing', title: 'В работе' },
]

const CARDS: KanbanCard[] = [
	{ id: 'a', columnId: 'todo', title: 'Альфа', priority: 'highest' },
	{ id: 'c', columnId: 'doing', title: 'Гамма' },
]

const addButtons = () => screen.getAllByRole('button', { name: 'Добавить карточку' })

describe('BaseKanban: кнопки и подсказки на компонентах кита', () => {
	it('кнопка сворачивания: type=button, aria-expanded и имя меняются, список скрывается', async () => {
		const { container } = render(BaseKanban, { props: { columns: COLUMNS, cards: CARDS, isCollapsible: true } })
		const toggle = screen.getByRole('button', { name: 'Свернуть колонку «План»' })

		expect(toggle).toHaveAttribute('type', 'button')
		expect(toggle).toHaveClass('base-kanban__toggle')
		expect(toggle).toHaveAttribute('aria-expanded', 'true')
		expect(screen.getByRole('list', { name: /^План/ })).toBeInTheDocument()
		await fireEvent.click(toggle)
		const expand = screen.getByRole('button', { name: 'Развернуть колонку «План»' })
		expect(expand).toHaveAttribute('aria-expanded', 'false')
		expect(screen.queryByRole('list', { name: /^План/ })).toBeNull()
		expect(screen.queryByRole('button', { name: 'Альфа' })).toBeNull()
		expect(container.querySelector('[data-column-id="todo"]')).toHaveClass('base-kanban__column--collapsed')
		await fireEvent.click(expand)
		expect(screen.getByRole('button', { name: 'Свернуть колонку «План»' })).toHaveAttribute('aria-expanded', 'true')
		expect(screen.getByRole('list', { name: /^План/ })).toBeInTheDocument()
	})

	it('«Добавить карточку» — type=button с прежним классом; после добавления фокус остаётся в поле', async () => {
		const { emitted } = render(BaseKanban, { props: { columns: COLUMNS, cards: CARDS, isEditable: true } })
		const add = addButtons()[0]

		expect(add).toHaveAttribute('type', 'button')
		expect(add).toHaveClass('base-kanban__add')
		await fireEvent.click(add)
		const field = screen.getByRole('textbox', { name: 'Название новой карточки в «План»' })
		expect(field).toHaveFocus()
		await fireEvent.update(field, 'Дельта')
		await fireEvent.keyDown(field, { key: 'Enter' })
		expect(emitted('create')).toHaveLength(1)
		await waitFor(() => expect(field).toHaveFocus())
		await fireEvent.keyDown(field, { key: 'Escape' })
		await waitFor(() => expect(addButtons()[0]).toHaveFocus())
	})

	it('отмена кнопкой «Отмена» возвращает фокус на «Добавить карточку» своей колонки', async () => {
		render(BaseKanban, { props: { columns: COLUMNS, cards: CARDS, isEditable: true } })

		await fireEvent.click(addButtons()[1])
		await fireEvent.click(screen.getByRole('button', { name: 'Отмена' }))
		expect(screen.queryByRole('textbox')).toBeNull()
		await waitFor(() => expect(addButtons()[1]).toHaveFocus())
	})

	it('удаление последней карточки колонки переводит фокус на «Добавить карточку»', async () => {
		render(BaseKanban, { props: { columns: COLUMNS, cards: CARDS, isEditable: true } })

		await fireEvent.contextMenu(screen.getByRole('button', { name: 'Гамма' }))
		await fireEvent.click(await screen.findByRole('menuitem', { name: 'Удалить' }))
		await waitFor(() => expect(addButtons()[1]).toHaveFocus())
	})

	it('приоритет без title, обёрнут в подсказку с названием уровня', async () => {
		const { container } = render(BaseKanban, { props: { columns: COLUMNS, cards: CARDS } })
		const priority = container.querySelector('.base-kanban__priority--highest') as HTMLElement
		const wrapper = priority.closest('.base-tooltip') as HTMLElement

		expect(priority).not.toHaveAttribute('title')
		expect(wrapper).not.toBeNull()
		await fireEvent.mouseEnter(wrapper)
		expect(await screen.findByRole('tooltip')).toHaveTextContent('самый высокий')
	})
})
