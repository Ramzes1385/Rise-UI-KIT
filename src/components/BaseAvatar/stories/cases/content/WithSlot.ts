import { expect } from 'storybook/test'
import { CONTENT_ARGS } from '../../shared'
import { BaseIcon } from '@components/BaseIcon'
import type meta from '../../BaseAvatar.stories'
import BaseAvatar from '../../../ui/BaseAvatar.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const WithSlot: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'shape'] },
		docs: {
			description: { story: 'Слот `default` заменяет изображение и инициалы: иконка, счётчик, логотип.' },
			source: {
				code: ['<BaseAvatar>', '  <BaseIcon name="star" />', '</BaseAvatar>', '<BaseAvatar variant="soft">+3</BaseAvatar>'].join(
					'\n',
				),
			},
		},
	},
	render: args => ({
		components: { BaseAvatar, BaseIcon },
		setup: () => ({ props: useArgsWithoutSlots(args, CONTENT_ARGS) }),
		template: `
			<div class="story-row">
				<BaseAvatar v-bind="props"><BaseIcon name="star" /></BaseAvatar>
				<BaseAvatar v-bind="props" variant="soft">+3</BaseAvatar>
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByText('+3')).toBeVisible()
		await expect(canvas.queryByText('?')).not.toBeInTheDocument()
	},
}
