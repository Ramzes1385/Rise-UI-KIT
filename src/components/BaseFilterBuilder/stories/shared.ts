import type { FilterBuilderField, FilterBuilderGroup } from '../types/BaseFilterBuilder.types'

const STATUSES = [
	{ value: 'todo', label: 'К выполнению' },
	{ value: 'progress', label: 'В работе' },
	{ value: 'done', label: 'Готово' },
]

export const TASK_FIELDS: FilterBuilderField[] = [
	{ key: 'title', label: 'Задача', type: 'text' },
	{ key: 'status', label: 'Статус', type: 'select', options: STATUSES },
	{ key: 'estimate', label: 'Оценка', type: 'number' },
	{ key: 'due', label: 'Срок', type: 'date' },
	{ key: 'isUrgent', label: 'Срочно', type: 'boolean' },
]

export const TASKS = [
	{ id: 1, title: 'Тёмная тема для таблиц', status: 'todo', estimate: 3, due: '2025-05-20', isUrgent: false },
	{ id: 2, title: 'Поиск по эмодзи', status: 'todo', estimate: 1, due: '', isUrgent: false },
	{ id: 3, title: 'Кнопка «Отправить» в чате', status: 'progress', estimate: 5, due: '2025-05-15', isUrgent: true },
	{ id: 4, title: 'Канбан-доска', status: 'progress', estimate: 8, due: '2025-05-12', isUrgent: true },
	{ id: 5, title: 'Markdown без v-html', status: 'done', estimate: 2, due: '2025-05-02', isUrgent: false },
	{ id: 6, title: 'Экспорт таблицы в CSV', status: 'done', estimate: 3, due: '', isUrgent: false },
]

export const TASK_COLUMNS = [
	{ key: 'title', label: 'Задача' },
	{ key: 'status', label: 'Статус', formatter: (value: unknown) => STATUSES.find(status => status.value === value)?.label ?? '' },
	{ key: 'estimate', label: 'Оценка', align: 'right' as const },
	{ key: 'due', label: 'Срок' },
	{ key: 'isUrgent', label: 'Срочно', formatter: (value: unknown) => (value ? 'да' : '') },
]

export const SAMPLE_FILTER: FilterBuilderGroup = {
	match: 'all',
	conditions: [
		{ id: 'sample-status', field: 'status', operator: 'ne', value: 'done' },
		{ id: 'sample-estimate', field: 'estimate', operator: 'gte', value: '3' },
	],
}
