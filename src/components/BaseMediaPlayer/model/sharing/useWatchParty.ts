import { isSafeUrl } from '@utils/data/urlUtils'
import { UI_PLAYER, formatMessage } from '../messages'
import { computed, onBeforeUnmount, watch } from 'vue'
import type {
	MediaWatchEvent,
	MediaWatchMember,
	MediaWatchOptions,
	MediaWatchEventType,
	MediaWatchMemberView,
} from '../../types/panels/MediaWatch.types'

const ECHO_WINDOW = 600

const DRIFT = 0.5

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const AVATAR_PROTOCOLS = ['http:', 'https:', 'blob:', 'data:'] as const

const MEDIA_EVENTS = { play: 'play', pause: 'pause', seeked: 'seek', ratechange: 'rate' } as const

function statusText(member: MediaWatchMember): string {
	if (member.isHost) return UI_PLAYER.WATCH_HOST
	return member.status === 'joined' ? UI_PLAYER.WATCH_JOINED : UI_PLAYER.WATCH_PENDING
}

function memberView(member: MediaWatchMember): MediaWatchMemberView {
	const initials = member.name
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map(word => word[0].toUpperCase())
		.join('')
	const avatar = member.avatar && isSafeUrl(member.avatar, AVATAR_PROTOCOLS) ? member.avatar : undefined
	const badgeStatus = member.status === 'joined' ? 'success' : 'neutral'
	return { ...member, avatar, initials, statusText: statusText(member), badgeStatus }
}

function useEchoGuard() {
	const expected = new Map<MediaWatchEventType, number>()
	return {
		expect(type: MediaWatchEventType): void {
			expected.set(type, Date.now() + ECHO_WINDOW)
		},
		isEcho(type: MediaWatchEventType): boolean {
			const until = expected.get(type)
			expected.delete(type)
			return until !== undefined && Date.now() < until
		},
	}
}

function useSyncEvents(options: MediaWatchOptions, isEcho: (type: MediaWatchEventType) => boolean): void {
	const send = (event: Event): void => {
		const type = MEDIA_EVENTS[event.type as keyof typeof MEDIA_EVENTS]
		if (!options.party() || isEcho(type)) return
		const media = event.target as HTMLMediaElement
		options.emitSync(type === 'rate' ? { type, time: media.currentTime, rate: media.playbackRate } : { type, time: media.currentTime })
	}
	const listen = (media: HTMLMediaElement | null | undefined, method: 'addEventListener' | 'removeEventListener'): void =>
		Object.keys(MEDIA_EVENTS).forEach(name => media?.[method](name, send))
	watch(
		options.media,
		(media, previous) => {
			listen(previous, 'removeEventListener')
			listen(media, 'addEventListener')
		},
		{ immediate: true },
	)
	onBeforeUnmount(() => listen(options.media.value, 'removeEventListener'))
}

export function useWatchParty(options: MediaWatchOptions) {
	const echo = useEchoGuard()
	useSyncEvents(options, echo.isEcho)
	const members = computed(() => options.party()?.members ?? [])

	return {
		hasWatchParty: computed(() => Boolean(options.party())),
		watchLink: computed(() => options.party()?.link ?? ''),
		watchMembers: computed(() => members.value.map(memberView)),
		watchCount: computed(() => members.value.filter(member => member.status === 'joined').length),
		copyWatchLink: (): void => options.copy(options.party()?.link ?? ''),
		inviteToWatch(email: string): boolean {
			const address = email.trim()
			if (!EMAIL_PATTERN.test(address)) return false
			options.emitInvite(address)
			options.flash(formatMessage(UI_PLAYER.WATCH_INVITED, { email: address }))
			return true
		},
		applyWatchEvent(event: MediaWatchEvent): void {
			if (Math.abs(options.state.currentTime - event.time) > DRIFT) {
				echo.expect('seek')
				options.actions.seek(event.time)
			}
			if (event.type === 'play') {
				echo.expect('play')
				void options.actions.play()
			} else if (event.type === 'pause') {
				echo.expect('pause')
				options.actions.pause()
			} else if (event.type === 'rate' && event.rate) {
				echo.expect('rate')
				options.actions.setPlaybackRate(event.rate)
			}
		},
	}
}
