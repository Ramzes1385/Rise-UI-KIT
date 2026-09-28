import type meta from '../BaseSkeleton.stories'
import BaseSkeleton from '../../ui/BaseSkeleton.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const Shapes: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['isAnimated', 'isPulse', 'sizeScale'] },
		docs: {
			description: {
				story: 'Три формы: строки текста (`text`), блок (`rect`) — изображение или карточка, круг (`circle`) — аватар.',
			},
			source: {
				code: [
					'<BaseSkeleton shape="text" width="80%" />',
					'<BaseSkeleton shape="rect" width="100%" :height="120" />',
					'<BaseSkeleton shape="circle" :width="40" :height="40" />',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseSkeleton },
		setup: () => ({ props: useArgsWithoutSlots(args, ['default', 'shape', 'width', 'height']) }),
		template: `
			<div class="story-stack">
				<div class="story-row" style="flex-wrap: nowrap;">
					<span class="story-label">text</span>
					<BaseSkeleton v-bind="props" shape="text" width="80%" />
				</div>
				<div class="story-row" style="flex-wrap: nowrap;">
					<span class="story-label">rect</span>
					<BaseSkeleton v-bind="props" shape="rect" width="100%" :height="120" />
				</div>
				<div class="story-row" style="flex-wrap: nowrap;">
					<span class="story-label">circle</span>
					<BaseSkeleton v-bind="props" shape="circle" :width="40" :height="40" />
				</div>
			</div>
		`,
	}),
}
