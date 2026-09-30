import BaseChat from '../ui/BaseChat.vue'
import type { Meta } from '@storybook/vue3-vite'
import { CHAT_SCRIPT, useStoryMessages } from './shared'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-medium">
		<BaseChat
			v-bind="args"
			:messages="messages"
			@send="send"
			@send-voice="sendVoice"
			@message-reaction="react"
			@delete-messages="remove"
			@pin-message="pin"
			@unpin-message="unpin" />
	</div>
`

export const source = storySource({
	template,
	imports: ['BaseChat', 'type ChatMessage', 'type VoiceRecording'],
	models: { messages: 'messages' },
	types: { messages: 'ChatMessage[]' },
	script: CHAT_SCRIPT,
})

export const render = (args => ({
	components: { BaseChat },
	setup: useStorySetup(args, { slots: ['messages'], setup: () => useStoryMessages(args) }),
	template,
})) satisfies Meta<typeof BaseChat>['render']
