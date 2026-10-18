import type meta from '../../BaseRoadmap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseRoadmap from '../../../ui/BaseRoadmap.vue'
import { imports, models, types } from '../../render'
import { expect, screen, waitFor, within } from 'storybook/test'
import { docsFrame, STORY_WAIT_TIMEOUT, storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div style="width: 375px; max-width: 100%">
		<BaseRoadmap
			v-bind="args"
			v-model:progress="progress"
			v-model:expanded="expanded"
			v-model:selected="selected"
			v-model:filter="filter" />
	</div>
`

export const Narrow: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			...docsFrame(820),
			description: {
				story: [
					'Телефон, 375 px: в контейнере уже `narrowWidth` (560 px) раскладка сама становится `narrowLayout` — списком, переключатель',
					'раскладок и легенда скрыты, сводка короче, «Продолжить» закреплена внизу кнопкой на всю ширину. Подробности темы',
					'открываются нижней шторкой (`detailsPosition: "auto"`), Escape или «Назад» закрывают её, фокус возвращается на тему.',
					'Проп `narrowLayout: null` оставляет выбранную раскладку и в узком контейнере.',
				].join('\n'),
			},
			source: storySource({ template, imports, models, types }),
		},
	},
	args: { selected: null, expanded: ['s4'] },
	render: args => ({
		components: { BaseRoadmap },
		setup: useStorySetup(args, { models, slots: [] }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		await waitFor(() => expect(canvasElement.querySelector('.base-roadmap__list')).not.toBeNull())
		await expect(canvas.queryByRole('radiogroup', { name: 'Раскладка пути' })).toBeNull()
		await userEvent.click(canvas.getByRole('button', { name: 'Продолжить: Pinia' }))
		const sheet = await screen.findByRole('dialog', { name: 'Pinia' }, { timeout: STORY_WAIT_TIMEOUT })
		await waitFor(() => expect(within(sheet).getByText('Что изучить')).toBeVisible(), { timeout: STORY_WAIT_TIMEOUT })
		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Pinia' })).toBeNull(), { timeout: STORY_WAIT_TIMEOUT })
		await waitFor(() => expect(canvas.getByRole('button', { name: /^Pinia/ })).toHaveFocus(), { timeout: STORY_WAIT_TIMEOUT })
	},
}
