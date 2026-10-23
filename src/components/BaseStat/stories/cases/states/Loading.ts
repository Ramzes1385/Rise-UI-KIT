import { expect } from 'storybook/test'
import type meta from '../../BaseStat.stories'
import BaseStat from '../../../ui/BaseStat.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `<div style="max-width: 280px"><BaseStat v-bind="args" /></div>`

export const Loading: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Данные ещё грузятся: заглушки вместо значения и изменения, подпись видна, на корне `aria-busy`.' },
			source: storySource({ template, imports: ['BaseStat'] }),
		},
	},
	args: { isLoading: true },
	render: args => ({
		components: { BaseStat },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvasElement }) => {
		const stat = canvasElement.querySelector('.base-stat') as HTMLElement
		await expect(stat).toHaveAttribute('aria-busy', 'true')
		await expect(stat.querySelectorAll('.base-skeleton')).toHaveLength(2)
	},
}
