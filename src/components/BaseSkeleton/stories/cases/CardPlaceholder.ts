import { expect } from 'storybook/test'
import type meta from '../BaseSkeleton.stories'
import BaseSkeleton from '../../ui/BaseSkeleton.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-frame" role="group" aria-busy="true" aria-label="Загрузка профиля">
		<div class="story-stack">
			<div class="story-row" style="flex-wrap: nowrap;">
				<BaseSkeleton v-bind="args" shape="circle" :width="40" :height="40" />
				<div class="story-stack" style="gap: 8px;">
					<BaseSkeleton v-bind="args" shape="text" width="40%" />
					<BaseSkeleton v-bind="args" shape="text" width="25%" :height="12" />
				</div>
			</div>
			<BaseSkeleton v-bind="args" shape="rect" width="100%" :height="72" />
		</div>
	</div>
`

export const CardPlaceholder: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['isAnimated', 'isPulse', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Заглушка карточки профиля: скелетоны повторяют аватар, имя, должность и описание. Контейнер помечен',
					'`aria-busy="true"` и назван «Загрузка профиля» — так скринридер знает, что содержимое ещё грузится.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseSkeleton'], omit: ['default', 'shape', 'width', 'height'] }),
		},
	},
	render: args => ({
		components: { BaseSkeleton },
		setup: useStorySetup(args, { slots: ['default', 'shape', 'width', 'height'] }),
		template,
	}),
	play: async ({ canvas, canvasElement }) => {
		await expect(canvas.getByRole('group', { name: 'Загрузка профиля' })).toHaveAttribute('aria-busy', 'true')
		for (const skeleton of canvasElement.querySelectorAll('.base-skeleton')) {
			await expect(skeleton).toHaveAttribute('aria-hidden', 'true')
		}
	},
}
