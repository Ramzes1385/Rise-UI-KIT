import type meta from '../../BaseChat.stories'
import BaseChat from '../../../ui/BaseChat.vue'
import { SHOWCASE_MESSAGES } from '../../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import { CHAT_VARIANTS } from '../../../types/BaseChat.types'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const messages = SHOWCASE_MESSAGES

const template = `
	<div class="story-grid" style="--story-grid-min: 320px;">
		<BaseChat
			v-for="variant in variants"
			:key="variant"
			v-bind="args"
			:messages="messages"
			:variant="variant"
			:subtitle="variant"
			height="420px" />
	</div>
`

const script = `
const variants = ${literal(CHAT_VARIANTS)}
const messages: ChatMessage[] = ${literal(messages)}
`

export const Variants: StoryObj<typeof meta> = {
	args: { quickReplies: [] },
	parameters: {
		controls: { include: ['sizeScale'] },
		docs: {
			description: {
				story: [
					'Три варианта оформления сообщений. `bubble` — мягкие пузыри: свои справа (primary-soft), чужие слева (bg-elevated);',
					'`flat` — без пузырей, сообщения разделены линией; `modern` — карточки с рамкой.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseChat', 'type ChatMessage'], script }),
		},
	},
	render: args => ({
		components: { BaseChat },
		setup: useStorySetup(args, { data: { variants: CHAT_VARIANTS, messages } }),
		template,
	}),
}
