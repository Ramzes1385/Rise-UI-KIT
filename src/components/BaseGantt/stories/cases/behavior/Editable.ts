import { PROJECT_TASKS } from '../../shared'
import type meta from '../../BaseGantt.stories'
import { expect, waitFor } from 'storybook/test'
import BaseGantt from '../../../ui/BaseGantt.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const state = { tasks: PROJECT_TASKS }

const template = `
	<BaseGantt v-bind="args" :tasks="tasks" @update:task="tasks = tasks.map(item => (item.id === $event.id ? $event : item))" />
`

export const Editable: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'scale'] },
		docs: {
			description: {
				story: [
					'`isEditable`: полосу тянут мышью (сдвиг дат), за левый и правый край меняют длительность; сдвиг округляется до целых дней.',
					'С клавиатуры: на фокусе полосы стрелки сдвигают на шаг шкалы (здесь — день), Shift со стрелками меняет длительность; результат читает живой регион.',
					'Диаграмма данные сама не меняет: `update:task` отдаёт задачу с новыми датами в том же виде, что были у задачи (здесь — строки `ГГГГ-ММ-ДД`),',
					'а пример подставляет её в свой массив. `task-change` добавляет вид правки (`move`, `resize-start`, `resize-end`) и источник (`pointer`, `keyboard`).',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseGantt', 'type GanttTask'],
				state,
				types: { tasks: 'GanttTask[]' },
				omit: ['tasks'],
			}),
		},
	},
	args: { isEditable: true, scale: 'day', height: 460 },
	render: args => ({
		components: { BaseGantt },
		setup: useStorySetup(args, { state, slots: ['tasks'] }),
		template,
	}),
	play: async ({ canvas, userEvent, args }) => {
		const ui = canvas.getByRole('button', { name: /^Интерфейс: / })
		ui.focus()
		await userEvent.keyboard('{ArrowRight}')
		await waitFor(() => expect(canvas.getByRole('button', { name: /^Интерфейс: 13 мая 2025 г\. — 17 мая 2025 г\./ })).toHaveFocus())
		await expect(canvas.getByRole('status')).toHaveTextContent('Задача «Интерфейс» перенесена')
		await userEvent.keyboard('{Shift>}{ArrowRight}{/Shift}')
		await waitFor(() => expect(canvas.getByRole('button', { name: /^Интерфейс: 13 мая 2025 г\. — 18 мая 2025 г\./ })).toBeVisible())
		await expect(canvas.getByRole('status')).toHaveTextContent('Длительность задачи «Интерфейс»: 6 дней')

		const bar = canvas.getByRole('button', { name: /^Исследование: / })
		const box = bar.getBoundingClientRect()
		const [x, y] = [box.left + box.width / 2, box.top + box.height / 2]
		await userEvent.pointer([
			{ keys: '[MouseLeft>]', target: bar, coords: { clientX: x, clientY: y } },
			{ target: bar, coords: { clientX: x + 72, clientY: y } },
			{ keys: '[/MouseLeft]', target: bar, coords: { clientX: x + 72, clientY: y } },
		])
		await waitFor(() => expect(canvas.getByRole('button', { name: /^Исследование: 7 мая 2025 г\. — 10 мая 2025 г\./ })).toBeVisible())
		await expect(args['onTask-change']).toHaveBeenLastCalledWith(expect.objectContaining({ kind: 'move', source: 'pointer' }))
		await expect(args['onUpdate:task']).toHaveBeenCalledTimes(3)
	},
}
