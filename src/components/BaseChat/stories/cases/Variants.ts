import type meta from '../BaseChat.stories'
import BaseChat from '../../ui/BaseChat.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { CHAT_VARIANTS } from '../../types/BaseChat.types'
import { SHOWCASE_MESSAGES, PRIVATE_CHAT } from '../shared'

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['sizeScale'] },
		docs: {
			description: {
				story: [
					'Три варианта оформления сообщений. `bubble` — мягкие пузыри: свои справа (primary-soft), чужие слева (bg-elevated);',
					'`flat` — без пузырей, сообщения разделены линией; `modern` — карточки с рамкой.',
				].join('\n'),
			},
			source: {
				code: CHAT_VARIANTS.map(variant => `<BaseChat :messages="messages" title="Анна Смирнова" variant="${variant}" />`).join(
					'\n',
				),
			},
		},
	},
	render: args => ({
		components: { BaseChat },
		setup: () => ({ sizeScale: args.sizeScale, variants: CHAT_VARIANTS, messages: SHOWCASE_MESSAGES, chat: PRIVATE_CHAT }),
		template: `
			<div class="story-grid" style="--story-grid-min: 320px;">
				<BaseChat
					v-for="variant in variants"
					:key="variant"
					v-bind="chat"
					:messages="messages"
					:variant="variant"
					:subtitle="variant"
					:size-scale="sizeScale"
					height="420px" />
			</div>
		`,
	}),
}
