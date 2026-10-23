import { expect, waitFor } from 'storybook/test'
import type meta from '../../../BaseChat.stories'
import BaseChat from '../../../../ui/BaseChat.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, storySource, tabTo, useStorySetup } from '@/stories/helpers'
import { GROUP_CHAT, GROUP_MESSAGES, getMessage, useStoryMessages } from '../../../shared'

const PANEL = /^Закреплённое сообщение/
const EARLIER = GROUP_MESSAGES.slice(0, 3)

const template = `
	<div class="story-medium">
		<BaseChat v-bind="args" :messages="messages" @jump-to-message="jump" />
	</div>
`

const script = `
const earlier: ChatMessage[] = ${literal(EARLIER)}

function jump(id: string): void {
	if (!messages.value.some(message => message.id === id)) messages.value = [...earlier, ...messages.value]
}
`

export const PinnedJump: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			source: storySource({
				template,
				imports: ['BaseChat', 'type ChatMessage'],
				models: { messages: 'messages' },
				types: { messages: 'ChatMessage[]' },
				script,
			}),
			description: {
				story: [
					'Переход к закрепу, которого нет в загруженной части истории: в `pinnedMessages` есть сообщение, а в `messages` его нет',
					'(`hasMoreMessages`). Клик по панели закрепа вместо прокрутки эмитит `jump-to-message` с id сообщения. Приложение',
					'подгружает старые сообщения и добавляет их в `messages` — как только нужное сообщение появилось, лента сама прокручивается',
					'к нему и подсвечивает его. В примере приложение «подгружает» первые три сообщения по событию.',
				].join('\n'),
			},
		},
	},
	args: {
		...GROUP_CHAT,
		messages: GROUP_MESSAGES.slice(3),
		pinnedMessages: [GROUP_MESSAGES[0]],
		hasMoreMessages: true,
		quickReplies: [],
	},
	render: args => ({
		components: { BaseChat },
		setup: useStorySetup(args, {
			slots: ['messages'],
			setup: () => {
				const { messages } = useStoryMessages(args)
				const jump = (id: string): void => {
					if (!messages.value.some(message => message.id === id)) messages.value = [...EARLIER, ...messages.value]
				}
				return { messages, jump }
			},
		}),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent, args }) => {
		const log = canvas.getByRole('log', { name: 'Сообщения' })
		await expect(canvasElement.querySelector('#message-g1')).toBeNull()
		await expect(log.querySelectorAll('.base-chat-message-list__item')).toHaveLength(3)

		const panel = canvas.getByRole('button', { name: PANEL })
		await expect(panel).toHaveAccessibleName(/Коллеги, релиз 1\.4/)
		await tabTo(panel, userEvent, 30)
		await userEvent.keyboard('{Enter}')
		await expect(args['onJump-to-message']).toHaveBeenCalledWith('g1')

		await waitFor(() => expect(log.querySelectorAll('.base-chat-message-list__item')).toHaveLength(6))
		await waitFor(() => expect(getMessage(canvasElement, 'g1')).toHaveClass('base-chat-message-list__item--highlighted'))
	},
}
