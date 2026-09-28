import type meta from '../BaseSkeleton.stories'
import BaseSkeleton from '../../ui/BaseSkeleton.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const Animations: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['sizeScale', 'color'] },
		docs: {
			description: { story: 'Движение: шиммер (`isAnimated`, по умолчанию), мерцание (`isPulse`) или статичная заглушка.' },
			source: {
				code: [
					'<BaseSkeleton width="100%" :height="32" />',
					'<BaseSkeleton width="100%" :height="32" :is-animated="false" is-pulse />',
					'<BaseSkeleton width="100%" :height="32" :is-animated="false" />',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseSkeleton },
		setup: () => ({ props: useArgsWithoutSlots(args, ['default', 'shape', 'width', 'height', 'isAnimated', 'isPulse']) }),
		template: `
			<div class="story-stack">
				<div class="story-row" style="flex-wrap: nowrap;">
					<span class="story-label">Шиммер</span>
					<BaseSkeleton v-bind="props" width="100%" :height="32" />
				</div>
				<div class="story-row" style="flex-wrap: nowrap;">
					<span class="story-label">Мерцание</span>
					<BaseSkeleton v-bind="props" width="100%" :height="32" :is-animated="false" is-pulse />
				</div>
				<div class="story-row" style="flex-wrap: nowrap;">
					<span class="story-label">Без движения</span>
					<BaseSkeleton v-bind="props" width="100%" :height="32" :is-animated="false" />
				</div>
			</div>
		`,
	}),
}
