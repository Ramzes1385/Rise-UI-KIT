import { expect } from 'storybook/test'
import { BaseIcon } from '@components/BaseIcon'
import type meta from '../../BaseSeparator.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseSeparator from '../../../ui/BaseSeparator.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-stack">
		<BaseSeparator v-bind="args"><BaseIcon name="star" :size-scale="80" /></BaseSeparator>
		<BaseSeparator v-bind="args">15 мая, четверг</BaseSeparator>
	</div>
`

export const WithSlot: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['isDashed', 'thickness', 'color', 'sizeScale'] },
		docs: {
			description: { story: 'Слот `default` вместо `label`: иконка или дата в ленте сообщений. Текст слота — имя разделителя.' },
			source: storySource({ template, imports: ['BaseSeparator', 'BaseIcon'], omit: ['default', 'label'] }),
		},
	},
	render: args => ({
		components: { BaseSeparator, BaseIcon },
		setup: useStorySetup(args, { slots: ['default', 'label'] }),
		template,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('separator', { name: '15 мая, четверг' })).toBeVisible()
	},
}
