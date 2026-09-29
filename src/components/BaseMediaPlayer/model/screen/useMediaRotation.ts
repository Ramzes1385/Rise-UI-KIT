import { computed, ref, watch } from 'vue'
import type { MediaRotation, MediaRotationOptions } from '../../types/playback/MediaScreen.types'

const QUARTER = 90

const FULL_TURN = 360

function screenOrientation(): ScreenOrientation | undefined {
	return typeof screen === 'undefined' ? undefined : (screen.orientation as ScreenOrientation | undefined)
}

function lockOrientation(isFullscreen: boolean, media: HTMLMediaElement | null, rotation: MediaRotation): void {
	const orientation = screenOrientation()
	if (typeof orientation?.lock !== 'function') return
	if (!isFullscreen) return orientation.unlock()
	const video = media as HTMLVideoElement | null
	const isWide = !video?.videoHeight || video.videoWidth >= video.videoHeight
	const isSideways = rotation % (QUARTER * 2) !== 0
	orientation.lock(isWide === isSideways ? 'portrait' : 'landscape').catch(() => undefined)
}

export function useMediaRotation(options: MediaRotationOptions) {
	const rotation = ref<MediaRotation>(0)
	watch(options.isFullscreen, isFullscreen => lockOrientation(isFullscreen, options.media.value, rotation.value))

	return {
		rotation,
		rotationClass: computed(() => (rotation.value ? `base-media-player--rotate-${rotation.value}` : '')),
		rotationText: computed(() => `${rotation.value}°`),
		rotateFrame(): void {
			rotation.value = ((rotation.value + QUARTER) % FULL_TURN) as MediaRotation
		},
	}
}
