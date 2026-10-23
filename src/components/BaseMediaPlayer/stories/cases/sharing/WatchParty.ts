import { ref } from 'vue'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseMediaPlayer.stories'
import { useDemoWatchParty } from '../../demo/watchDemo'
import { expect, fireEvent, within } from 'storybook/test'
import BaseMediaPlayer from '../../../ui/BaseMediaPlayer.vue'
import { storySource, useStorySetup } from '@/stories/helpers'
import type { BaseMediaPlayerExpose } from '../../../types/BaseMediaPlayer.types'

const template = `
	<BaseMediaPlayer ref="player" v-bind="args" :watch-party="room" @watch-sync="send" @watch-invite="invite" />
`

const script = `
type Hello = { type: 'hello' | 'welcome'; member: MediaWatchMember; time?: number; isPaused?: boolean }

type Message = Hello | { type: 'sync'; event: MediaWatchEvent } | { type: 'bye'; id: string }

const CHANNEL = 'rise-media-watch-demo'
const GUEST_PARAM = 'watch-guest'

function guestLink(): string {
	const url = new URL(window.location.href)
	url.searchParams.set(GUEST_PARAM, '1')
	return url.toString()
}

function selfMember(): MediaWatchMember {
	const id = Math.random().toString(36).slice(2, 8)
	const isGuest = new URL(window.location.href).searchParams.has(GUEST_PARAM)
	return isGuest ? { id, name: \`Гость \${id.slice(0, 3)}\`, status: 'joined' } : { id, name: 'Вы', status: 'joined', isHost: true }
}

const player = ref<BaseMediaPlayerExpose | null>(null)
const self = selfMember()
const room = reactive<MediaWatchParty & { members: MediaWatchMember[] }>({ link: guestLink(), members: [self] })
const channel = typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel(CHANNEL)
const post = (message: Message): void => channel?.postMessage(message)

function addMember(member: MediaWatchMember): void {
	room.members = [...room.members.filter(item => item.id !== member.id), { ...member, status: 'joined' }]
}

function greet(message: Hello): void {
	addMember(message.member)
	if (message.type === 'hello') {
		const state = player.value?.state
		post({ type: 'welcome', member: self, time: state?.currentTime, isPaused: state?.isPaused })
	} else if (message.member.isHost && message.time !== undefined) {
		player.value?.applyWatchEvent({ type: message.isPaused ? 'pause' : 'play', time: message.time })
	}
}

function receive({ data }: MessageEvent<Message>): void {
	if (data.type === 'sync') player.value?.applyWatchEvent(data.event)
	else if (data.type === 'bye') room.members = room.members.filter(member => member.id !== data.id)
	else greet(data)
}

const leave = (): void => post({ type: 'bye', id: self.id })

function send(event: MediaWatchEvent): void {
	post({ type: 'sync', event })
}

function invite(email: string): void {
	room.members = [...room.members, { id: email, name: email.split('@')[0], email, status: 'invited' }]
}

channel?.addEventListener('message', receive)
onMounted(() => {
	post({ type: 'hello', member: self })
	window.addEventListener('pagehide', leave)
})
onBeforeUnmount(() => {
	leave()
	window.removeEventListener('pagehide', leave)
	channel?.close()
})
`

export const WatchParty: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			story: { inline: false, height: '560px' },
			description: {
				story: [
					'Совместный просмотр (`watch-party`): кнопка «Совместный просмотр» открывает окно со ссылкой-приглашением,',
					'приглашением по почте и списком участников. Плеер только показывает окно и обменивается командами: письмо',
					'по событию `watch-invite` отправляет приложение, запуск, пауза, перемотка и скорость приходят событием `watch-sync`',
					'— приложение рассылает их участникам через свой сервер (WebSocket, WebRTC), а команды других участников передаёт',
					'в `applyWatchEvent` через ref плеера. Участников и ссылку ведёт приложение (`watchParty.members`, `watchParty.link`).',
					'',
					'В этой истории вместо сервера — BroadcastChannel браузера: скопируйте ссылку и откройте её в новой вкладке — гость',
					'появится в списке «Смотрит», пауза и перемотка станут общими. Браузер запускает звук только после щелчка на',
					'странице, поэтому в новой вкладке один раз нажмите «Воспроизвести». Приглашение по почте здесь добавляет участника',
					'со статусом «Приглашён» — письма нет.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: [],
				importsFrom: {
					'@ramzes1385/rise-ui-kit/media': [
						'BaseMediaPlayer',
						'type BaseMediaPlayerExpose',
						'type MediaWatchEvent',
						'type MediaWatchMember',
						'type MediaWatchParty',
					],
				},
				vue: ['onBeforeUnmount', 'onMounted', 'reactive', 'ref'],
				script,
				omit: ['watchParty', 'onWatch-sync', 'onWatch-invite'],
			}),
		},
	},
	render: args => ({
		components: { BaseMediaPlayer },
		setup: useStorySetup(args, {
			setup: () => {
				const player = ref<BaseMediaPlayerExpose | null>(null)
				const { room, send, invite } = useDemoWatchParty(player)
				return { player, room, send, invite }
			},
		}),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		const player = within(canvasElement.querySelector('.base-media-player') as HTMLElement)
		await userEvent.click(canvas.getByRole('button', { name: 'Совместный просмотр' }))
		const panel = within(await player.findByRole('group', { name: 'Совместный просмотр' }))
		const link = panel.getByRole('textbox', { name: 'Ссылка-приглашение' }) as HTMLInputElement
		await expect(new URL(link.value).searchParams.get('watch-guest')).toBe('1')
		await userEvent.type(panel.getByRole('textbox', { name: 'Почта участника' }), 'anna@example.com')
		await fireEvent.submit(canvasElement.querySelector('.base-media-player__watch form') as HTMLFormElement)
		await expect(await panel.findByText('anna@example.com')).toBeInTheDocument()
		await expect(panel.getByText('Приглашён').closest('.base-badge')).toHaveClass('base-badge--status-neutral')
		await expect(panel.getByText('Ведущий').closest('.base-badge')).toHaveClass('base-badge--status-success')
	},
}
