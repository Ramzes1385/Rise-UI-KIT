import { expect } from 'storybook/test'
import { CONTENT_ARGS } from '../../shared'
import { BaseIcon } from '@components/BaseIcon'
import type meta from '../../BaseAvatar.stories'
import BaseAvatar from '../../../ui/BaseAvatar.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-row">
		<BaseAvatar v-bind="args"><BaseIcon name="star" /></BaseAvatar>
		<BaseAvatar v-bind="args" variant="soft">+3</BaseAvatar>
	</div>
`

export const WithSlot: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'shape'] },
		docs: {
			description: { story: 'Слот `default` заменяет изображение и инициалы: иконка, счётчик, логотип.' },
			source: storySource({ template, imports: ['BaseAvatar', 'BaseIcon'], omit: CONTENT_ARGS }),
		},
	},
	render: args => ({
		components: { BaseAvatar, BaseIcon },
		setup: useStorySetup(args, { slots: CONTENT_ARGS }),
		template,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByText('+3')).toBeVisible()
		await expect(canvas.queryByText('?')).not.toBeInTheDocument()
	},
}
