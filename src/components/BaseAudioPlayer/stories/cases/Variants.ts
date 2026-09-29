import type meta from '../BaseAudioPlayer.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseAudioPlayer from '../../ui/BaseAudioPlayer.vue'

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'default — карточка с рамкой; soft — приподнятый фон; ghost — без фона, цвета от текста вокруг: так плеер встаёт в пузырь сообщения.',
			},
		},
		controls: { include: ['sizeScale'] },
	},
	render: args => ({
		components: { BaseAudioPlayer },
		setup: () => ({ args }),
		template: `
			<div class="story-col" style="gap: 16px; max-width: 420px;">
				<BaseAudioPlayer v-bind="args" variant="default" title="default" />
				<BaseAudioPlayer v-bind="args" variant="soft" title="soft" />
				<div style="padding: 8px 12px; border-radius: 16px; background: var(--rise-primary); color: var(--rise-on-primary);">
					<BaseAudioPlayer v-bind="args" variant="ghost" title="ghost в пузыре сообщения" />
				</div>
			</div>
		`,
	}),
}
