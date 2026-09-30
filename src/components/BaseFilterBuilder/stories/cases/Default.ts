import { computed, ref } from 'vue'
import { BaseTable } from '@components/BaseTable'
import type meta from '../BaseFilterBuilder.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, waitFor, within } from 'storybook/test'
import BaseFilterBuilder from '../../ui/BaseFilterBuilder.vue'
import { tabTo, useArgsWithoutSlots } from '@/stories/helpers'
import { createFilterPredicate } from '../../model/filters/filterPredicate'
import { SAMPLE_FILTER, TASK_COLUMNS, TASK_FIELDS, TASKS } from '../shared'
import type { FilterBuilderGroup } from '../../types/BaseFilterBuilder.types'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Фильтр задач над BaseTable: строки отбирает `createFilterPredicate`. Добавьте условие, смените связку или сбросьте фильтр.',
			},
		},
	},
	render: args => ({
		components: { BaseFilterBuilder, BaseTable },
		setup() {
			const filter = ref<FilterBuilderGroup>(args.modelValue ?? SAMPLE_FILTER)
			const rows = computed(() =>
				TASKS.filter(createFilterPredicate(filter.value, TASK_FIELDS)).map(task => ({ id: task.id, data: task })),
			)
			return { props: useArgsWithoutSlots(args), filter, rows, columns: TASK_COLUMNS, total: TASKS.length }
		},
		template: `
			<div style="display: flex; flex-direction: column; gap: 16px; max-width: 820px">
				<BaseFilterBuilder v-bind="props" v-model="filter" />
				<p style="margin: 0" aria-live="polite">Найдено: {{ rows.length }} из {{ total }}</p>
				<BaseTable :columns="columns" :rows="rows" />
			</div>`,
	}),
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
