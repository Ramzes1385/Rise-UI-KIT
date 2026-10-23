import { nextTick, ref } from 'vue'
import type meta from '../../BaseChat.stories'
import BaseChat from '../../../ui/BaseChat.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, waitFor, within } from 'storybook/test'
import { OLDER_MESSAGES, RECENT_MESSAGES } from '../../timeline'
import { CHAT_SCRIPT, getMessage, useStoryMessages } from '../../shared'
import { literal, storySource, STORY_TODAY, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-medium">
		<BaseChat
			v-bind="args"
			:messages="messages"
			:has-more-messages="hasMore"
			:is-loading-more="isLoadingMore"
			@send="send"
			@send-voice="sendVoice"
			@message-reaction="react"
			@delete-messages="remove"
			@pin-message="pin"
			@unpin-message="unpin"
			@edit="edit"
			@load-more="loadMore" />
	</div>
`

const LOAD_MORE_SCRIPT = `
const older: ChatMessage[] = ${literal(OLDER_MESSAGES)}

const hasMore = ref(true)
const isLoadingMore = ref(false)

async function loadMore(): Promise<void> {
	isLoadingMore.value = true
	await nextTick()
	messages.value = [...older, ...messages.value]
	hasMore.value = false
	isLoadingMore.value = false
}
`

export const LoadMore: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Подгрузка истории: пока `hasMoreMessages`, прокрутка к началу ленты вызывает `load-more`; `isLoadingMore` показывает',
					'индикатор вверху и гасит повторные события. Приложение добавляет более старые сообщения в начало списка — позиция',
					'чтения сохраняется, лента не «прыгает». Пример подгружает одну страницу и выключает `hasMoreMessages`.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseChat', 'type ChatMessage', 'type VoiceRecording'],
				models: { messages: 'messages' },
				types: { messages: 'ChatMessage[]' },
				vue: ['nextTick', 'ref'],
				script: `${CHAT_SCRIPT}${LOAD_MORE_SCRIPT}`,
			}),
		},
	},
	args: { messages: RECENT_MESSAGES, today: STORY_TODAY.toISOString(), quickReplies: [] },
	render: args => ({
		components: { BaseChat },
		setup: useStorySetup(args, {
			slots: ['messages'],
			setup: () => {
				const hasMore = ref(true)
				const isLoadingMore = ref(false)
				const story = useStoryMessages(args)

				async function loadMore(): Promise<void> {
					isLoadingMore.value = true
					await nextTick()
					story.messages.value = [...OLDER_MESSAGES, ...story.messages.value]
					hasMore.value = false
					isLoadingMore.value = false
				}

				return { ...story, hasMore, isLoadingMore, loadMore }
			},
		}),
		template,
	}),
	play: async ({ canvas, canvasElement, args }) => {
		const log = canvas.getByRole('log', { name: 'Сообщения' })
		await waitFor(() => expect(log.scrollTop).toBeGreaterThan(0))
		await expect(args['onLoad-more']).not.toHaveBeenCalled()

		const anchor = getMessage(canvasElement, 'r1')
		log.scrollTop = 20
		const before = anchor.getBoundingClientRect().top

		await waitFor(() => expect(args['onLoad-more']).toHaveBeenCalledTimes(1))
		await waitFor(() => expect(within(log).getByText('Вчера обсудили план на неделю.')).toBeInTheDocument())
		await waitFor(() => expect(Math.abs(anchor.getBoundingClientRect().top - before)).toBeLessThanOrEqual(2))
		await expect(canvas.queryByRole('status', { name: 'Загрузка более ранних сообщений' })).not.toBeInTheDocument()
	},
}
