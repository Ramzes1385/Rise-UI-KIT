import { expect } from 'storybook/test'
import type meta from '../BaseAvatar.stories'
import BaseAvatar from '../../ui/BaseAvatar.vue'
import { CONTENT_ARGS, anna, oleg } from '../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const OnlineStatus: StoryObj<typeof meta> = {
	args: { isOnline: true },
	parameters: {
		docs: {
			description: {
				story: [
					'Статус «в сети»: точка цвета success с кольцом цвета фона. Статус передаётся не только цветом —',
					'у точки есть доступное имя «в сети».',
				].join('\n'),
			},
		},
		controls: { include: ['variant', 'sizeScale', 'shape', 'isOnline'] },
	},
	render: args => ({
		components: { BaseAvatar },
		setup: () => ({ props: useArgsWithoutSlots(args, CONTENT_ARGS), anna, oleg }),
		template: `
			<div class="story-row">
				<BaseAvatar v-bind="props" :src="anna.avatar" :name="anna.name" />
				<BaseAvatar v-bind="props" :name="oleg.name" />
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getAllByRole('img', { name: 'в сети' })).toHaveLength(2)
	},
}
