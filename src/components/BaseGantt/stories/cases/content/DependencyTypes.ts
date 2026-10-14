import { expect } from 'storybook/test'
import { LINK_TYPE_TASKS } from '../../shared'
import type meta from '../../BaseGantt.stories'
import BaseGantt from '../../../ui/BaseGantt.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<BaseGantt v-bind="args" />
`

export const DependencyTypes: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'scale'] },
		docs: {
			description: {
				story: [
					'Тип связи задаётся в `dependencies` объектом `{ id, type }`: `FS` — окончание — начало (по умолчанию, достаточно `id`), `SS` — начало — начало,',
					'`FF` — окончание — окончание, `SF` — начало — окончание. Первая буква — край предшественника, вторая — край зависимой задачи; стрелка идёт от первого ко второму.',
					'Скринридер получает связи через `aria-describedby` полосы: «Зависит от: «Основа» (начало — начало)». Критический путь и перенос зависимых задач не поддерживаются.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseGantt'] }),
		},
	},
	args: { tasks: LINK_TYPE_TASKS, scale: 'day', height: 300, today: '2025-05-10' },
	render: args => ({
		components: { BaseGantt },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas, canvasElement }) => {
		const lines = canvasElement.querySelector('.base-gantt__arrow-lines')?.getAttribute('d') ?? ''
		await expect(lines.split('M').length - 1).toBe(4)

		const bar = canvas.getByRole('button', { name: /^Начало — окончание: / })
		const description = document.getElementById(bar.getAttribute('aria-describedby') ?? '')
		await expect(description).toHaveTextContent('Зависит от: «Основа» (начало — окончание)')
	},
}
