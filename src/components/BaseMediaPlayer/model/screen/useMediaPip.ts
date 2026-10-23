import { UI_PLAYER } from '../messages'
import { computed, ref, watch } from 'vue'
import type { MediaElementRef } from '../../types/playback/MediaCore.types'

const PIP_EVENTS = ['enterpictureinpicture', 'leavepictureinpicture']

export function useMediaPip(media: MediaElementRef) {
	const isPip = ref(false)
	const isPipSupported = ref(false)
	watch(
		media,
		(element, _, onCleanup) => {
			const video = element instanceof HTMLVideoElement ? element : null
			isPipSupported.value = Boolean(video && document.pictureInPictureEnabled && !video.disablePictureInPicture)
			if (!video) return
			const sync = (): void => {
				isPip.value = document.pictureInPictureElement === video
			}
			PIP_EVENTS.forEach(name => video.addEventListener(name, sync))
			onCleanup(() => PIP_EVENTS.forEach(name => video.removeEventListener(name, sync)))
		},
		{ immediate: true, flush: 'post' },
	)
	return {
		isPip,
		isPipSupported,
		pipLabel: computed(() => (isPip.value ? UI_PLAYER.EXIT_PIP : UI_PLAYER.PIP)),
		async togglePip(): Promise<void> {
			const video = media.value as HTMLVideoElement | null
			if (!video) return
			if (document.pictureInPictureElement) await document.exitPictureInPicture().catch(() => undefined)
			else await video.requestPictureInPicture().catch(() => undefined)
		},
	}
}
