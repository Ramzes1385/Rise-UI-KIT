import type meta from '../../BaseSkeleton.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseSkeleton from '../../../ui/BaseSkeleton.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-stack">
		<div class="story-row" style="flex-wrap: nowrap;">
			<span class="story-label">text</span>
			<BaseSkeleton v-bind="args" shape="text" width="80%" />
		</div>
		<div class="story-row" style="flex-wrap: nowrap;">
			<span class="story-label">rect</span>
			<BaseSkeleton v-bind="args" shape="rect" width="100%" :height="120" />
		</div>
		<div class="story-row" style="flex-wrap: nowrap;">
			<span class="story-label">circle</span>
			<BaseSkeleton v-bind="args" shape="circle" :width="40" :height="40" />
		</div>
	</div>
`

export const Shapes: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['isAnimated', 'isPulse', 'sizeScale'] },
		docs: {
			description: {
				story: 'Три формы: строки текста (`text`), блок (`rect`) — изображение или карточка, круг (`circle`) — аватар.',
			},
			source: storySource({ template, imports: ['BaseSkeleton'], omit: ['default', 'shape', 'width', 'height'] }),
		},
	},
	render: args => ({
		components: { BaseSkeleton },
		setup: useStorySetup(args, { slots: ['default', 'shape', 'width', 'height'] }),
		template,
	}),
}
