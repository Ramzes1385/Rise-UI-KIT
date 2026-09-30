import type meta from '../BaseSkeleton.stories'
import BaseSkeleton from '../../ui/BaseSkeleton.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-stack">
		<div class="story-row" style="flex-wrap: nowrap;">
			<span class="story-label">Шиммер</span>
			<BaseSkeleton v-bind="args" width="100%" :height="32" />
		</div>
		<div class="story-row" style="flex-wrap: nowrap;">
			<span class="story-label">Мерцание</span>
			<BaseSkeleton v-bind="args" width="100%" :height="32" :is-animated="false" is-pulse />
		</div>
		<div class="story-row" style="flex-wrap: nowrap;">
			<span class="story-label">Без движения</span>
			<BaseSkeleton v-bind="args" width="100%" :height="32" :is-animated="false" />
		</div>
	</div>
`

export const Animations: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['sizeScale', 'color'] },
		docs: {
			description: { story: 'Движение: шиммер (`isAnimated`, по умолчанию), мерцание (`isPulse`) или статичная заглушка.' },
			source: storySource({
				template,
				imports: ['BaseSkeleton'],
				omit: ['default', 'shape', 'width', 'height', 'isAnimated', 'isPulse'],
			}),
		},
	},
	render: args => ({
		components: { BaseSkeleton },
		setup: useStorySetup(args, { slots: ['default', 'shape', 'width', 'height', 'isAnimated', 'isPulse'] }),
		template,
	}),
}
