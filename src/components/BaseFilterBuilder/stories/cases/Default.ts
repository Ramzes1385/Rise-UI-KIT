import { computed } from 'vue'
import type { Ref } from 'vue'
import { BaseTable } from '@components/BaseTable'
import type meta from '../BaseFilterBuilder.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, waitFor, within } from 'storybook/test'
import BaseFilterBuilder from '../../ui/BaseFilterBuilder.vue'
import { STATUSES, TASK_COLUMNS, TASK_FIELDS, TASKS } from '../shared'
import { createFilterPredicate } from '../../model/filters/filterPredicate'
import type { FilterBuilderGroup } from '../../types/BaseFilterBuilder.types'
import { literal, storySource, tabTo, useStorySetup } from '@/stories/helpers'

const models = { filter: 'modelValue' }

const template = `
	<div style="display: flex; flex-direction: column; gap: 16px; max-width: 820px">
		<BaseFilterBuilder v-bind="args" v-model="filter" />
		<p style="margin: 0" aria-live="polite">Найдено: {{ rows.length }} из {{ tasks.length }}</p>
		<BaseTable :columns="columns" :rows="rows" />
	</div>
`

const script = [
	`const statuses = ${literal(STATUSES)}`,
	`const tasks = ${literal(TASKS)}`,
	'const columns = [',
	"\t{ key: 'title', label: 'Задача' },",
	"\t{ key: 'status', label: 'Статус', formatter: (value: unknown) => statuses.find(status => status.value === value)?.label ?? '' },",
	"\t{ key: 'estimate', label: 'Оценка', align: 'right' as const },",
	"\t{ key: 'due', label: 'Срок' },",
	"\t{ key: 'isUrgent', label: 'Срочно', formatter: (value: unknown) => (value ? 'да' : '') },",
	']',
	'const rows = computed(() => tasks.filter(createFilterPredicate(filter.value, fields)).map(task => ({ id: task.id, data: task })))',
].join('\n')

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Фильтр задач над BaseTable: строки отбирает `createFilterPredicate`. Добавьте условие, смените связку или сбросьте фильтр.',
			},
			source: storySource({
				template,
				imports: ['BaseFilterBuilder', 'BaseTable', 'createFilterPredicate'],
				models,
				vue: ['computed'],
				script,
			}),
		},
	},
	render: args => {
		const storySetup = useStorySetup(args, { models, data: { tasks: TASKS, columns: TASK_COLUMNS } })
		return {
			components: { BaseFilterBuilder, BaseTable },
			setup() {
				const context = storySetup()
				const filter = context.filter as Ref<FilterBuilderGroup>
				const rows = computed(() =>
					TASKS.filter(createFilterPredicate(filter.value, args.fields ?? TASK_FIELDS)).map(task => ({
						id: task.id,
						data: task,
					})),
				)
				return { ...context, rows }
			},
			template,
		}
	},
	play: async ({ canvas, userEvent }) => {
		const found = (text: string) => waitFor(() => expect(canvas.getByText(/^Найдено:/)).toHaveTextContent(text))
		await found('Найдено: 3 из 6')
		await tabTo(canvas.getByRole('button', { name: 'Добавить условие' }), userEvent)
		await userEvent.keyboard('{Enter}')
		const third = canvas.getByRole('group', { name: 'Условие 3' })
		await expect(within(third).getByRole('combobox', { name: 'Поле' })).toHaveFocus()
		await userEvent.selectOptions(within(third).getByRole('combobox', { name: 'Поле' }), 'Срочно')
		await found('Найдено: 2 из 6')
		await userEvent.selectOptions(canvas.getByRole('combobox', { name: 'Показывать строки, где выполняются' }), 'any')
		await found('Найдено: 5 из 6')
		await userEvent.click(canvas.getByRole('button', { name: 'Удалить условие 3' }))
		await expect(canvas.queryByRole('group', { name: 'Условие 3' })).toBeNull()
		await userEvent.click(canvas.getByRole('button', { name: 'Сбросить' }))
		await found('Найдено: 6 из 6')
		await expect(canvas.getByRole('button', { name: 'Добавить условие' })).toHaveFocus()
	},
}
