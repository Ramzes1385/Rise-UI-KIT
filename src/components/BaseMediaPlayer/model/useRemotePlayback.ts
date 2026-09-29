import { computed, ref, watch } from 'vue'
import type { MediaCastState } from '../types/MediaCast.types'
import type { MediaElementRef } from '../types/MediaCore.types'

const REMOTE_EVENTS = ['connecting', 'connect', 'disconnect']

const DISMISS_ERRORS = ['NotAllowedError', 'AbortError']

export function useRemotePlayback(media: MediaElementRef) {
	const isAvailable = ref(false)
	const state = ref<MediaCastState>('disconnected')
	watch(
		media,
		(element, _, onCleanup) => {
			const remote = element?.remote
			if (!remote) return
			let watchId: number | undefined
			const sync = (): void => {
				state.value = remote.state
			}
			remote
				.watchAvailability(available => {
					isAvailable.value = available
				})
				.then(id => {
					watchId = id
				})
				.catch(() => {
					isAvailable.value = false
				})
			REMOTE_EVENTS.forEach(name => remote.addEventListener(name, sync))
			onCleanup(() => {
				REMOTE_EVENTS.forEach(name => remote.removeEventListener(name, sync))
				if (watchId !== undefined) void remote.cancelWatchAvailability(watchId).catch(() => undefined)
			})
		},
		{ immediate: true },
	)

	return {
		isRemoteAvailable: isAvailable,
		remoteState: state,
		isRemoteConnected: computed(() => state.value === 'connected'),
		async promptRemote(): Promise<boolean> {
			const remote = media.value?.remote
			if (!remote) return false
			return remote.prompt().then(
				() => true,
				(error: unknown) => error instanceof DOMException && DISMISS_ERRORS.includes(error.name),
			)
		},
	}
}
