import type { Ref } from 'vue'
import { onBeforeUnmount, onMounted, reactive } from 'vue'
import type { BaseMediaPlayerExpose } from '../../types/BaseMediaPlayer.types'
import type { MediaWatchEvent, MediaWatchMember, MediaWatchParty } from '../../types/panels/MediaWatch.types'

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
	return isGuest ? { id, name: `Гость ${id.slice(0, 3)}`, status: 'joined' } : { id, name: 'Вы', status: 'joined', isHost: true }
}

export function useDemoWatchParty(player: Ref<BaseMediaPlayerExpose | null>) {
	const self = selfMember()
	const room = reactive<MediaWatchParty & { members: MediaWatchMember[] }>({ link: guestLink(), members: [self] })
	const channel = typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel(CHANNEL)
	const post = (message: Message): void => channel?.postMessage(message)
	const addMember = (member: MediaWatchMember): void => {
		room.members = [...room.members.filter(item => item.id !== member.id), { ...member, status: 'joined' }]
	}
	const greet = (message: Hello): void => {
		addMember(message.member)
		if (message.type === 'hello') {
			const state = player.value?.state
			post({ type: 'welcome', member: self, time: state?.currentTime, isPaused: state?.isPaused })
		} else if (message.member.isHost && message.time !== undefined) {
			player.value?.applyWatchEvent({ type: message.isPaused ? 'pause' : 'play', time: message.time })
		}
	}
	const receive = ({ data }: MessageEvent<Message>): void => {
		if (data.type === 'sync') player.value?.applyWatchEvent(data.event)
		else if (data.type === 'bye') room.members = room.members.filter(member => member.id !== data.id)
		else greet(data)
	}
	const leave = (): void => post({ type: 'bye', id: self.id })
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

	return {
		room,
		send: (event: MediaWatchEvent): void => post({ type: 'sync', event }),
		invite(email: string): void {
			room.members = [...room.members, { id: email, name: email.split('@')[0], email, status: 'invited' }]
		},
	}
}
