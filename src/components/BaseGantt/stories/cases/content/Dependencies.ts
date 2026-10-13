import { expect } from 'storybook/test'
import type meta from '../../BaseGantt.stories'
import BaseGantt from '../../../ui/BaseGantt.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<BaseGantt v-bind="args" />
`

export const Dependencies: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'scale'] },
		docs: {
			description: {
				story: [
					'Зависимость «окончание — начало»: стрелка идёт от конца предшественника к началу задачи, `dependencies: [id, …]` у зависимой.',
					'Стрелка огибает строки, если следующая задача начинается раньше окончания предыдущей; у скрытых свёрнутым этапом задач стрелок нет.',
					'Неизвестные `id` и зависимости, замыкающие цикл, пропускаются с предупреждением в консоли.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseGantt'] }),
		},
	},
	args: { scale: 'day', height: 460 },
	render: args => ({
		components: { BaseGantt },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvasElement }) => {
		const lines = canvasElement.querySelector('.base-gantt__arrow-lines')?.getAttribute('d') ?? ''
		await expect(lines.split('M').length - 1).toBe(8)
		await expect(canvasElement.querySelector('.base-gantt__arrow-heads')?.getAttribute('d')).toContain('z')
	},
}
