import { manyTasks } from '../../shared'
import type meta from '../../BaseGantt.stories'
import { expect, waitFor } from 'storybook/test'
import BaseGantt from '../../../ui/BaseGantt.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<BaseGantt v-bind="args" />
`

const LONG_NAME = 'Согласование проектной документации с заказчиком, подрядчиками и надзорными органами по всем разделам'

export const LongContent: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'scale'] },
		docs: {
			description: {
				story: [
					'Триста с лишним задач и очень длинное название: в DOM только видимые строки (виртуализация, высота строки фиксирована), поэтому прокрутка не тормозит.',
					'Длинное название обрезается многоточием, список остаётся у левого края при горизонтальной прокрутке, шкала — у верхнего.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseGantt'] }),
		},
	},
	args: {
		tasks: [{ id: 'long', name: LONG_NAME, start: '2025-05-05', end: '2025-05-20', progress: 35 }, ...manyTasks(110)],
		scale: 'day',
		height: 420,
	},
	render: args => ({
		components: { BaseGantt },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas, canvasElement }) => {
		await expect(canvas.getByRole('treegrid')).toHaveAttribute('aria-rowcount', '332')
		await expect(canvasElement.querySelectorAll('[data-row-index]').length).toBeLessThan(60)
		const name = canvas.getByText(LONG_NAME)
		await expect(name.scrollWidth).toBeGreaterThan(name.clientWidth)
		const viewport = canvasElement.querySelector('.base-gantt__viewport') as HTMLElement
		viewport.scrollTop = viewport.scrollHeight
		await waitFor(() => expect(canvas.getByText('Выполнение этапа 110')).toBeVisible())
		await expect(canvasElement.querySelectorAll('[data-row-index]').length).toBeLessThan(60)
	},
}
