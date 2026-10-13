import { expect } from 'storybook/test'
import type meta from '../../BaseGantt.stories'
import BaseGantt from '../../../ui/BaseGantt.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<BaseGantt v-bind="args" />
`

export const CustomColor: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'scale'] },
		docs: {
			description: {
				story: 'Кастомный цвет через `color`: заливка и рамка полос и вех, светлая подложка полос считается от него. Для общей перекраски хватает токена `--rise-gantt-bar-bg`.',
			},
			source: storySource({ template, imports: ['BaseGantt'] }),
		},
	},
	args: { color: { bg: { base: '#6d28d9' } } },
	render: args => ({
		components: { BaseGantt },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvasElement }) => {
		const fill = canvasElement.querySelector('.base-gantt__progress') as HTMLElement
		await expect(getComputedStyle(fill).backgroundColor).toBe('rgb(109, 40, 217)')
		const milestone = canvasElement.querySelector('.base-gantt__milestone') as HTMLElement
		await expect(getComputedStyle(milestone).backgroundColor).toBe('rgb(109, 40, 217)')
	},
}
