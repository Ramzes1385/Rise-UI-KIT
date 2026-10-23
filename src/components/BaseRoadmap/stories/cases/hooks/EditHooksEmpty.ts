import { expect, within } from 'storybook/test'
import type meta from '../../BaseRoadmap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseRoadmap from '../../../ui/BaseRoadmap.vue'
import { editTemplate, visible } from '../edit/editShared'
import { storySource, useStorySetup } from '@/stories/helpers'
import { hooksArgs, hooksControls, hooksModels, hooksTypes, openHooksTab } from './hooksShared'

export const EditHooksEmpty: StoryObj<typeof meta> = {
	parameters: {
		controls: hooksControls,
		docs: {
			description: {
				story: [
					'Без подписок вкладка «Хуки 0» показывает одну строку-подсказку: как подписаться — `ref.on` или пропсы `before-change`,',
					'`before-delete`, `before-status-change`. Правка при этом идёт без проверок приложения. Подписки на хуки — см. `EditHooks`.',
				].join('\n'),
			},
			source: storySource({
				template: editTemplate,
				imports: ['BaseRoadmap', 'type RoadmapData', 'type RoadmapMode'],
				models: hooksModels,
				types: hooksTypes,
			}),
		},
	},
	args: hooksArgs,
	render: args => ({
		components: { BaseRoadmap },
		setup: useStorySetup(args, { models: hooksModels, slots: [] }),
		template: editTemplate,
	}),
	play: async ({ canvas, userEvent }) => {
		const { inspector, tab } = await openHooksTab(canvas, userEvent, /^Реактивность/)
		await expect(tab).toHaveTextContent('Хуки 0')
		await visible(() => within(inspector).getByText(/^Подписок нет/))
		await expect(within(inspector).queryByRole('switch')).toBeNull()
	},
}
