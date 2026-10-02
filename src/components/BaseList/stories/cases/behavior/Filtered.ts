import { TASKS } from '../../shared'
import type meta from '../../BaseList.stories'
import BaseList from '../../../ui/BaseList.vue'
import { expect, waitFor } from 'storybook/test'
import { BaseInput } from '@components/BaseInput'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const models = { tasks: 'items' }

const state = { query: '' }

const template = `
	<div class="story-narrow story-stack">
		<BaseInput v-model="query" type="search" aria-label="Поиск задач" placeholder="Поиск" />
		<BaseList
			v-bind="args"
			v-model:items="tasks"
			:filter="item => item.title.toLowerCase().includes(query.toLowerCase())" />
	</div>
`

export const Filtered: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'`filter` показывает часть строк — так строится поиск. Перестановка работает среди показанных строк, а скрытые',
					'сохраняют свои места в `items`. Ничего не нашлось — пустое состояние списка.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseInput', 'BaseList'], models, state }),
		},
	},
	args: { items: TASKS, selectionMode: 'none', isSortable: true, label: 'Задачи спринта' },
	render: args => ({
		components: { BaseInput, BaseList },
		setup: useStorySetup(args, { models, state }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const search = canvas.getByRole('searchbox', { name: 'Поиск задач' })
		await userEvent.type(search, 'ы')
		await waitFor(() => expect(canvas.getAllByRole('listitem')).toHaveLength(3))
		await userEvent.clear(search)
		await userEvent.type(search, 'нет такой')
		await waitFor(() => expect(canvas.getByText('Список пуст')).toBeVisible())
		await userEvent.clear(search)
		await waitFor(() => expect(canvas.getAllByRole('listitem')).toHaveLength(4))
	},
}
