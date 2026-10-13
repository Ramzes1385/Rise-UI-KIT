import { expect } from 'storybook/test'
import { MILESTONE_TASKS } from '../../shared'
import type meta from '../../BaseGantt.stories'
import BaseGantt from '../../../ui/BaseGantt.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<BaseGantt v-bind="args" />
`

export const Milestones: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'scale'] },
		docs: {
			description: {
				story: [
					'Веха — задача с `isMilestone: true`: точка во времени без длительности (окончание игнорируется), рисуется ромбом в середине своего дня.',
					'Доступное имя — «Название: дата, веха». Веху можно сдвигать, но длительность у неё не меняется.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseGantt'] }),
		},
	},
	args: { tasks: MILESTONE_TASKS, scale: 'day', height: 280 },
	render: args => ({
		components: { BaseGantt },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas, canvasElement }) => {
		await expect(canvasElement.querySelectorAll('.base-gantt__milestone')).toHaveLength(3)
		await expect(canvas.getByRole('button', { name: /^Демо заказчику: .*веха$/ })).toBeVisible()
		const diamond = canvasElement.querySelector('.base-gantt__milestone') as HTMLElement
		await expect(diamond.getBoundingClientRect().width).toBeCloseTo(diamond.getBoundingClientRect().height, 0)
	},
}
