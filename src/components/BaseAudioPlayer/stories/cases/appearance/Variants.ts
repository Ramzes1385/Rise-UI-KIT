import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseAudioPlayer.stories'
import BaseAudioPlayer from '../../../ui/BaseAudioPlayer.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-col" style="gap: 16px; max-width: 420px;">
		<BaseAudioPlayer v-bind="args" variant="default" title="default" />
		<BaseAudioPlayer v-bind="args" variant="soft" title="soft" />
		<div style="padding: 8px 12px; border-radius: 16px; background: var(--rise-primary); color: var(--rise-on-primary);">
			<BaseAudioPlayer v-bind="args" variant="ghost" title="ghost в пузыре сообщения" />
		</div>
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'default — карточка с рамкой; soft — приподнятый фон; ghost — без фона, цвета от текста вокруг: так плеер встаёт в пузырь сообщения.',
			},
			source: storySource({ template, imports: ['BaseAudioPlayer'] }),
		},
		controls: { include: ['sizeScale'] },
	},
	render: args => ({
		components: { BaseAudioPlayer },
		setup: useStorySetup(args),
		template,
	}),
}
