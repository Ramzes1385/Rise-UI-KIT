import { computed } from 'vue'
import type { Ref } from 'vue'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseFilterBuilder.stories'
import { expect, waitFor, within } from 'storybook/test'
import BaseFilterBuilder from '../../../ui/BaseFilterBuilder.vue'
import { BaseKanban, type KanbanCard } from '@components/BaseKanban'
import { createFilterPredicate } from '../../../model/filters/filterPredicate'
import { literal, STORY_TODAY, storySource, useStorySetup } from '@/stories/helpers'
import type { FilterBuilderField, FilterBuilderGroup } from '../../../types/BaseFilterBuilder.types'

const FIELDS: FilterBuilderField[] = [
	{ key: 'title', label: 'Название', type: 'text' },
	{
		key: 'priority',
		label: 'Приоритет',
		type: 'select',
		options: [
			{ value: 'highest', label: 'Самый высокий' },
			{ value: 'high', label: 'Высокий' },
			{ value: 'medium', label: 'Средний' },
			{ value: 'low', label: 'Низкий' },
		],
	},
	{ key: 'estimate', label: 'Оценка', type: 'number' },
	{ key: 'dueDate', label: 'Срок', type: 'date' },
]

const COLUMNS = [
	{ id: 'todo', title: 'К выполнению' },
	{ id: 'progress', title: 'В работе' },
	{ id: 'done', title: 'Готово', isDone: true },
]

const CARDS: KanbanCard[] = [
	{
		id: 'k1',
		columnId: 'todo',
		key: 'RISE-101',
		title: 'Тёмная тема для таблиц',
		priority: 'medium',
		estimate: 3,
		dueDate: '2025-05-20',
	},
	{ id: 'k2', columnId: 'todo', key: 'RISE-102', title: 'Поиск по эмодзи', priority: 'low', estimate: 1 },
	{
		id: 'k3',
		columnId: 'progress',
		key: 'RISE-095',
		title: 'Кнопка «Отправить» в чате',
		priority: 'high',
		estimate: 5,
		dueDate: '2025-05-15',
	},
	{ id: 'k4', columnId: 'progress', key: 'RISE-097', title: 'Канбан-доска', priority: 'highest', estimate: 8, dueDate: '2025-05-12' },
	{ id: 'k5', columnId: 'done', key: 'RISE-090', title: 'Markdown без v-html', priority: 'high', estimate: 2 },
]

const models = { filter: 'modelValue' }

const state = { cards: CARDS }

const template = `
	<div style="display: flex; flex-direction: column; gap: 16px">
		<BaseFilterBuilder v-bind="args" v-model="filter" style="max-width: 720px" />
		<BaseKanban v-model:cards="cards" :columns="columns" :filter="predicate" :today="today" />
	</div>
`

const script = [
	`const columns = ${literal(COLUMNS)}`,
	`const today = ${literal(STORY_TODAY)}`,
	'const predicate = computed(() => (filter.value.conditions.length ? createFilterPredicate<KanbanCard>(filter.value, fields) : undefined))',
].join('\n')

export const WithKanban: StoryObj<typeof meta> = {
	args: {
		fields: FIELDS,
		modelValue: { match: 'all', conditions: [{ id: 'kanban-priority', field: 'priority', operator: 'eq', value: 'high' }] },
	},
	parameters: {
		docs: {
			description: {
				story: 'Фильтр для канбан-доски: `createFilterPredicate` передаётся в проп `filter` BaseKanban. Счётчики колонок показывают «1 из 2», скрытые карточки не теряются.',
			},
			source: storySource({
				template,
				imports: ['BaseFilterBuilder', 'BaseKanban', 'createFilterPredicate', 'type KanbanCard'],
				models,
				state,
				types: { cards: 'KanbanCard[]' },
				vue: ['computed'],
				script,
			}),
		},
	},
	render: args => {
		const storySetup = useStorySetup(args, { models, state, data: { columns: COLUMNS, today: STORY_TODAY } })
		return {
			components: { BaseFilterBuilder, BaseKanban },
			setup() {
				const context = storySetup()
				const filter = context.filter as Ref<FilterBuilderGroup>
				const predicate = computed(() =>
					filter.value.conditions.length ? createFilterPredicate<KanbanCard>(filter.value, args.fields ?? FIELDS) : undefined,
				)
				return { ...context, predicate }
			},
			template,
		}
	},
	play: async ({ canvas, userEvent }) => {
		await expect(canvas.getByRole('list', { name: /^В работе, 1 карточка/ })).toBeInTheDocument()
		await expect(canvas.queryByRole('button', { name: 'Канбан-доска' })).toBeNull()
		const condition = canvas.getByRole('group', { name: 'Условие 1' })
		await userEvent.selectOptions(within(condition).getByRole('combobox', { name: 'Сравнение' }), 'ne')
		await waitFor(() => expect(canvas.getByRole('button', { name: 'Канбан-доска' })).toBeInTheDocument())
		await expect(canvas.queryByRole('button', { name: 'Кнопка «Отправить» в чате' })).toBeNull()
	},
}
