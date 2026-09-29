import { isSafeUrl } from '@utils/urlUtils'
import { UI_PLAYER, formatMessage } from '../messages'
import { computed, onBeforeUnmount, watch } from 'vue'
import type { MediaWatchEvent, MediaWatchMember, MediaWatchOptions, MediaWatchMemberView } from '../../types/panels/MediaWatch.types'

const QUIET_AFTER_REMOTE = 600

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
	return { ...member, avatar, initials, statusText: statusText(member) }
}

function useSyncEvents(options: MediaWatchOptions, isQuiet: () => boolean): void {
	const send = (event: Event): void => {
		if (!options.party() || isQuiet()) return
		const media = event.target as HTMLMediaElement
		const type = MEDIA_EVENTS[event.type as keyof typeof MEDIA_EVENTS]
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
	let quietUntil = 0
	useSyncEvents(options, () => Date.now() < quietUntil)
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
			quietUntil = Date.now() + QUIET_AFTER_REMOTE
			if (Math.abs(options.state.currentTime - event.time) > DRIFT) options.actions.seek(event.time)
			if (event.type === 'play') void options.actions.play()
			else if (event.type === 'pause') options.actions.pause()
			else if (event.type === 'rate' && event.rate) options.actions.setPlaybackRate(event.rate)
		},
	}
}
