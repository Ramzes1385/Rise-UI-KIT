import type meta from '../../BaseList.stories'
import BaseList from '../../../ui/BaseList.vue'
import { TASKS, listTitles } from '../../shared'
import { expect, waitFor } from 'storybook/test'
import type { ListStoryArgs } from '../../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const models = { tasks: 'items' }

const template = `<div class="story-narrow"><BaseList v-bind="args" v-model:items="tasks" /></div>`

export const Sortable: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Перестановка (`is-sortable`, `v-model:items`) в режиме `none`: мышью — за любое место строки, на месте',
					'остаётся полупрозрачная строка; с клавиатуры — пробел берёт строку, ↑/↓ двигают, пробел или Enter кладут,',
					'Escape возвращает на прежнее место. Каждый шаг объявляется через `role="status"`, после броска приходят',
					'`update:items` и `move`.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseList'], models }),
		},
	},
	args: { items: TASKS, selectionMode: 'none', isSortable: true, label: 'Задачи спринта' },
	render: args => ({
		components: { BaseList },
		setup: useStorySetup(args, { models }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent, args }) => {
		const status = canvas.getByRole('status')
		await userEvent.tab()
		await userEvent.keyboard(' ')
		await waitFor(() => expect(status).toHaveTextContent('Строка «Макет главной» взята, место 1 из 4'))
		await userEvent.keyboard('{ArrowDown}')
		await waitFor(() => expect(status).toHaveTextContent('Место 2 из 4'))
		await userEvent.keyboard(' ')
		await waitFor(() => expect(status).toHaveTextContent('Строка «Макет главной» на месте 2 из 4'))
		await expect(listTitles(canvasElement)).toEqual(['Метод выгрузки', 'Макет главной', 'Тесты оплаты', 'Выпуск 2.0'])
		await expect((args as ListStoryArgs).onMove).toHaveBeenCalledWith(expect.objectContaining({ from: 0, to: 1 }))

		await userEvent.keyboard(' ')
		await userEvent.keyboard('{ArrowDown}')
		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(status).toHaveTextContent('Перемещение отменено, строка «Макет главной» на прежнем месте'))
		await expect(listTitles(canvasElement)).toEqual(['Метод выгрузки', 'Макет главной', 'Тесты оплаты', 'Выпуск 2.0'])
	},
}
