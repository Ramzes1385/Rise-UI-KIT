import { expect } from 'storybook/test'
import type meta from '../BaseStat.stories'
import BaseStat from '../../ui/BaseStat.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `<div style="max-width: 280px"><BaseStat v-bind="args" /></div>`

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Выручка в компактной записи рублей и рост к прошлому месяцу. Меняйте пропсы в Controls.' },
			source: storySource({ template, imports: ['BaseStat'] }),
		},
	},
	render: args => ({
		components: { BaseStat },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvasElement }) => {
		const stat = canvasElement.querySelector('.base-stat') as HTMLElement
		await expect(stat.querySelector('dt')).toHaveTextContent('Выручка')
		await expect(stat.querySelector('.base-stat__value')?.textContent?.replace(/\s/g, ' ')).toBe('4,82 млн ₽')
		await expect(stat.querySelector('.base-stat__change')).toHaveClass('base-stat__change--positive')
	},
}
