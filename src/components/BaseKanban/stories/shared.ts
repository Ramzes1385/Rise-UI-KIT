import type { KanbanCard, KanbanColumn } from '../types/BaseKanban.types'

export const COLUMNS: KanbanColumn[] = [
	{ id: 'todo', title: 'К выполнению' },
	{ id: 'progress', title: 'В работе', limit: 3 },
	{ id: 'review', title: 'На проверке', limit: 1 },
	{ id: 'done', title: 'Готово' },
]

export const CARDS: KanbanCard[] = [
	{ id: 'c1', columnId: 'todo', title: 'Тёмная тема для таблиц', description: 'Токены фона строк и выделения', tags: ['дизайн'] },
	{ id: 'c2', columnId: 'todo', title: 'Поиск по эмодзи', tags: ['чат'] },
	{ id: 'c3', columnId: 'todo', title: 'Экспорт таблицы в CSV' },
	{
		id: 'c4',
		columnId: 'progress',
		title: 'Кнопка «Отправить» в чате',
		description: 'Круглая, основного цвета, неактивна при пустом поле',
		tags: ['чат', 'доступность'],
	},
	{ id: 'c5', columnId: 'progress', title: 'Канбан-доска', tags: ['новый компонент'] },
	{ id: 'c6', columnId: 'review', title: 'Markdown без v-html', tags: ['безопасность'] },
	{ id: 'c7', columnId: 'review', title: 'Упоминания через @' },
]

export const SMALL_COLUMNS = COLUMNS.slice(0, 2)
