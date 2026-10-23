import type meta from '../../BaseList.stories'
import BaseList from '../../../ui/BaseList.vue'
import { TASKS, listTitles } from '../../shared'
import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const models = { selected: 'modelValue', tasks: 'items' }

const template = `<div class="story-narrow"><BaseList v-bind="args" v-model="selected" v-model:items="tasks" /></div>`

export const SortableSelect: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Выбор и перестановка вместе: пробел и Enter заняты выбором (APG Listbox), поэтому строку двигает Alt + ↑/↓ —',
					'сразу на соседнее место, фокус и выбор остаются на ней. Подсказка клавиш — в описании строки.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseList'], models, types: { selected: 'string[]' } }),
		},
	},
	args: { items: TASKS, selectionMode: 'multiple', modelValue: ['api'], isSortable: true, label: 'Задачи спринта' },
	render: args => ({
		components: { BaseList },
		setup: useStorySetup(args, { models }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		const api = canvas.getByRole('option', { name: /Метод выгрузки/ })
		await expect(api).toHaveAccessibleDescription('Alt + стрелка вверх или вниз — переместить строку')
		await userEvent.tab()
		await expect(api).toHaveFocus()
		await userEvent.keyboard('{Alt>}{ArrowUp}{/Alt}')
		await waitFor(() => expect(listTitles(canvasElement)).toEqual(['Метод выгрузки', 'Макет главной', 'Тесты оплаты', 'Выпуск 2.0']))
		await expect(canvas.getByRole('status')).toHaveTextContent('Строка «Метод выгрузки» на месте 1 из 4')
		await expect(canvas.getByRole('option', { name: /Метод выгрузки/ })).toHaveFocus()
		await expect(canvas.getByRole('option', { name: /Метод выгрузки/ })).toHaveAttribute('aria-selected', 'true')
		await userEvent.keyboard('{Alt>}{ArrowUp}{/Alt}')
		await expect(listTitles(canvasElement)[0]).toBe('Метод выгрузки')
	},
}
