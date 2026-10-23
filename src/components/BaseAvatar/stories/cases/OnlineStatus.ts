import { expect } from 'storybook/test'
import type meta from '../BaseAvatar.stories'
import BaseAvatar from '../../ui/BaseAvatar.vue'
import { CONTENT_ARGS, anna, oleg } from '../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-row">
		<BaseAvatar v-bind="args" :src="anna.avatar" :name="anna.name" />
		<BaseAvatar v-bind="args" :name="oleg.name" />
	</div>
`

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
			source: storySource({
				template,
				imports: ['BaseAvatar'],
				script: [`const anna = ${literal(anna)}`, `const oleg = ${literal(oleg)}`].join('\n'),
				omit: CONTENT_ARGS,
			}),
		},
		controls: { include: ['variant', 'sizeScale', 'shape', 'isOnline'] },
	},
	render: args => ({
		components: { BaseAvatar },
		setup: useStorySetup(args, { data: { anna, oleg }, slots: CONTENT_ARGS }),
		template,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getAllByRole('img', { name: 'в сети' })).toHaveLength(2)
	},
}
