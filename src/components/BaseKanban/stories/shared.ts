import { placeholderImage, STORY_USERS } from '@/stories/helpers'
import type { KanbanCard, KanbanColumn } from '../types/BaseKanban.types'

const [anna, ivan, maria, oleg, kate] = STORY_USERS.map(user => ({ name: user.name, avatar: user.avatar }))

export const COLUMNS: KanbanColumn[] = [
	{ id: 'todo', title: 'К выполнению' },
	{ id: 'progress', title: 'В работе', limit: 3 },
	{ id: 'review', title: 'На проверке', limit: 1 },
	{ id: 'done', title: 'Готово', isDone: true },
]

export const CARDS: KanbanCard[] = [
	{
		id: 'c1',
		columnId: 'todo',
		key: 'RISE-101',
		title: 'Тёмная тема для таблиц',
		description: 'Токены фона строк и выделения',
		labels: [{ text: 'дизайн', color: 'info' }],
		priority: 'medium',
		dueDate: '2025-05-20',
		comments: 2,
		estimate: 3,
		assignees: [anna],
	},
	{
		id: 'c2',
		columnId: 'todo',
		key: 'RISE-102',
		title: 'Поиск по эмодзи',
		labels: [{ text: 'чат', color: 'primary' }],
		priority: 'low',
		estimate: 1,
	},
	{ id: 'c3', columnId: 'todo', key: 'RISE-103', title: 'Экспорт таблицы в CSV', priority: 'lowest', attachments: 1 },
	{
		id: 'c4',
		columnId: 'progress',
		key: 'RISE-095',
		title: 'Кнопка «Отправить» в чате',
		description: 'Круглая, основного цвета, неактивна при пустом поле',
		labels: [
			{ text: 'чат', color: 'primary' },
			{ text: 'доступность', color: 'success' },
		],
		priority: 'high',
		dueDate: '2025-05-15',
		subtasks: { done: 2, total: 5 },
		comments: 7,
		estimate: 5,
		assignees: [ivan, maria],
		coverColor: 'var(--rise-primary)',
	},
	{
		id: 'c5',
		columnId: 'progress',
		key: 'RISE-097',
		title: 'Канбан-доска',
		labels: [{ text: 'новый компонент', color: 'warning' }],
		priority: 'highest',
		dueDate: '2025-05-12',
		subtasks: { done: 4, total: 4 },
		attachments: 3,
		estimate: 8,
		assignees: [anna, ivan, maria, oleg, kate],
		coverImage: placeholderImage({ width: 520, height: 224, hue: 200 }),
	},
	{
		id: 'c6',
		columnId: 'review',
		key: 'RISE-090',
		title: 'Markdown без v-html',
		labels: [{ text: 'безопасность', color: 'error' }],
		dueDate: '2025-05-16',
		comments: 1,
		assignees: [oleg],
	},
	{ id: 'c7', columnId: 'review', key: 'RISE-091', title: 'Упоминания через @', estimate: 2, assignees: [kate], dueDate: '2025-05-02' },
]

export const SMALL_COLUMNS = COLUMNS.slice(0, 2)
