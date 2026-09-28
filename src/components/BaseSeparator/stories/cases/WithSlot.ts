import { expect } from 'storybook/test'
import { BaseIcon } from '@components/BaseIcon'
import type meta from '../BaseSeparator.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseSeparator from '../../ui/BaseSeparator.vue'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const WithSlot: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['isDashed', 'thickness', 'color', 'sizeScale'] },
		docs: {
			description: { story: 'Слот `default` вместо `label`: иконка или дата в ленте сообщений. Текст слота — имя разделителя.' },
			source: {
				code: [
					'<BaseSeparator>',
					'  <BaseIcon name="star" />',
					'</BaseSeparator>',
					'<BaseSeparator>15 мая, четверг</BaseSeparator>',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseSeparator, BaseIcon },
		setup: () => ({ props: useArgsWithoutSlots(args, ['default', 'label']) }),
		template: `
			<div class="story-stack">
				<BaseSeparator v-bind="props"><BaseIcon name="star" :size-scale="80" /></BaseSeparator>
				<BaseSeparator v-bind="props">15 мая, четверг</BaseSeparator>
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('separator', { name: '15 мая, четверг' })).toBeVisible()
	},
}
