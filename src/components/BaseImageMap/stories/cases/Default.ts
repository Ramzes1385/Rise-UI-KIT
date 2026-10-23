import type meta from '../BaseImageMap.stories'
import BaseImageMap from '../../ui/BaseImageMap.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, screen, waitFor } from 'storybook/test'
import { storySource, tabTo, useStorySetup } from '@/stories/helpers'

const MODELS = { active: 'active' } as const

const template = `
	<div class="story-medium">
		<BaseImageMap v-bind="args" v-model:active="active" />
	</div>
`

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Песочница: картинка с точками и областями. Наведите указатель или перейдите Tab — появится подсказка; Enter или клик открывает окно объекта. Props — в панели Controls.',
			},
			source: storySource({ template, imports: ['BaseImageMap'], models: MODELS, types: { active: 'string | null' } }),
		},
	},
	render: args => ({
		components: { BaseImageMap },
		setup: useStorySetup(args, { models: MODELS }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const peak = canvas.getByRole('button', { name: 'Вершина' })
		await tabTo(peak, userEvent)
		await userEvent.keyboard('{Enter}')
		const dialog = await screen.findByRole('dialog', { name: 'Вершина' })
		await expect(dialog).toHaveTextContent('Смотровая площадка')
		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(peak).toHaveFocus())
		await expect(peak).toHaveAttribute('aria-current', 'true')
	},
}
