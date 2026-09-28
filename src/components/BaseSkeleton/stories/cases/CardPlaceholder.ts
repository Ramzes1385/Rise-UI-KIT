import { expect } from 'storybook/test'
import type meta from '../BaseSkeleton.stories'
import BaseSkeleton from '../../ui/BaseSkeleton.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'

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
			source: {
				code: [
					'<div aria-busy="true" aria-label="Загрузка профиля" role="group">',
					'  <BaseSkeleton shape="circle" :width="40" :height="40" />',
					'  <BaseSkeleton shape="text" width="40%" />',
					'  <BaseSkeleton shape="text" width="25%" :height="12" />',
					'  <BaseSkeleton shape="rect" width="100%" :height="72" />',
					'</div>',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseSkeleton },
		setup: () => ({ props: useArgsWithoutSlots(args, ['default', 'shape', 'width', 'height']) }),
		template: `
			<div class="story-frame" role="group" aria-busy="true" aria-label="Загрузка профиля">
				<div class="story-stack">
					<div class="story-row" style="flex-wrap: nowrap;">
						<BaseSkeleton v-bind="props" shape="circle" :width="40" :height="40" />
						<div class="story-stack" style="gap: 8px;">
							<BaseSkeleton v-bind="props" shape="text" width="40%" />
							<BaseSkeleton v-bind="props" shape="text" width="25%" :height="12" />
						</div>
					</div>
					<BaseSkeleton v-bind="props" shape="rect" width="100%" :height="72" />
				</div>
			</div>
		`,
	}),
	play: async ({ canvas, canvasElement }) => {
		await expect(canvas.getByRole('group', { name: 'Загрузка профиля' })).toHaveAttribute('aria-busy', 'true')
		for (const skeleton of canvasElement.querySelectorAll('.base-skeleton')) {
			await expect(skeleton).toHaveAttribute('aria-hidden', 'true')
		}
	},
}
