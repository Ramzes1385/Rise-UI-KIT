import { expect } from 'storybook/test'
import type meta from '../../BaseChat.stories'
import BaseChat from '../../../ui/BaseChat.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { CHAT_SCRIPT, useStoryMessages } from '../../shared'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const LIGHT = { bg: { base: '#f0f9ff' }, text: { base: '#0c4a6e' } }

const DARK = { bg: { base: '#0c1a2b' }, text: { base: '#e0f2fe' } }

const template = `
	<div class="story-medium">
		<BaseChat
			v-bind="args"
			:messages="messages"
			:color="color"
			@send="send"
			@send-voice="sendVoice"
			@message-reaction="react"
			@delete-messages="remove"
			@pin-message="pin"
			@unpin-message="unpin" />
	</div>
`

const script = `
const color =
	document.documentElement.dataset.theme === 'dark'
		? ${literal(DARK)}
		: ${literal(LIGHT)}
${CHAT_SCRIPT}`

function resolveColor(value: string): string {
	const probe = document.createElement('span')
	probe.style.color = value
	document.body.append(probe)
	const resolved = getComputedStyle(probe).color
	probe.remove()
	return resolved
}

export const CustomColor: StoryObj<typeof meta> = {
	render: args => ({
		components: { BaseChat },
		setup: useStorySetup(args, {
			slots: ['messages', 'color'],
			setup: () => ({
				color: document.documentElement.dataset.theme === 'dark' ? DARK : LIGHT,
				...useStoryMessages(args),
			}),
		}),
		template,
	}),
	parameters: {
		docs: {
			description: {
				story: [
					'Проп `color` красит фон окна и заголовок, например под бренд. Кнопки, поле ввода и аватары внутри не перекрашиваются:',
					'«Отправить» остаётся цвета `--rise-primary`. Для тёмной темы пример подставляет тёмный брендовый фон.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseChat', 'type ChatMessage', 'type VoiceRecording'],
				models: { messages: 'messages' },
				types: { messages: 'ChatMessage[]' },
				script,
				omit: ['color'],
			}),
		},
		controls: { exclude: ['color'] },
	},
	play: async ({ canvas, canvasElement, globals }) => {
		const root = canvasElement.querySelector('.base-chat') as HTMLElement
		const brand = globals.theme === 'dark' ? '#0c1a2b' : '#f0f9ff'
		await expect(getComputedStyle(root).backgroundColor).toBe(resolveColor(brand))
		await expect(getComputedStyle(canvas.getByRole('button', { name: 'Отправить сообщение' })).backgroundColor).toBe(
			resolveColor('var(--rise-primary)'),
		)
	},
}
