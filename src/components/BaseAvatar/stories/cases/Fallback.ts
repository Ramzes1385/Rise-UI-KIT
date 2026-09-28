import type meta from '../BaseAvatar.stories'
import { CONTENT_ARGS, ivan } from '../shared'
import BaseAvatar from '../../ui/BaseAvatar.vue'
import { waitFor, expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots, BROKEN_IMAGE_SRC } from '@/stories/helpers'

export const Fallback: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Запасное содержимое: изображение не загрузилось — инициалы из `name`; нет изображения — тоже инициалы;',
					'нет ни изображения, ни имени — «?».',
				].join('\n'),
			},
		},
		controls: { include: ['variant', 'sizeScale', 'shape'] },
	},
	render: args => ({
		components: { BaseAvatar },
		setup: () => ({ props: useArgsWithoutSlots(args, CONTENT_ARGS), brokenSrc: BROKEN_IMAGE_SRC, ivan }),
		template: `
			<div class="story-row" style="align-items: flex-start;">
				<div class="story-col" style="align-items: center; text-align: center;">
					<BaseAvatar v-bind="props" :src="brokenSrc" :name="ivan.name" />
					<span class="story-label">Ошибка загрузки</span>
				</div>
				<div class="story-col" style="align-items: center; text-align: center;">
					<BaseAvatar v-bind="props" :name="ivan.name" />
					<span class="story-label">Без изображения</span>
				</div>
				<div class="story-col" style="align-items: center; text-align: center;">
					<BaseAvatar v-bind="props" />
					<span class="story-label">Без имени</span>
				</div>
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		await waitFor(() => expect(canvas.getAllByText('ИП')).toHaveLength(2))
		await expect(canvas.queryByRole('img')).not.toBeInTheDocument()
		await expect(canvas.getByText('?')).toBeVisible()
	},
}
