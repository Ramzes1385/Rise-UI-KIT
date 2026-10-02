import { computed } from 'vue'
import { useMediaHotkeys } from '@components/BaseMediaPlayer/model/input/useMediaHotkeys'
import type { BasePresentationPlayerProps } from '../../types/BasePresentationPlayer.types'
import { useIdleControls } from '@components/BaseMediaPlayer/model/controls/useIdleControls'
import type { ElementRef, PresentationScreenSource } from '../../types/PresentationModel.types'
import { useMediaFullscreen } from '@components/BaseMediaPlayer/model/screen/useMediaFullscreen'

export function usePresentationScreen(
	props: BasePresentationPlayerProps,
	rootRef: ElementRef<HTMLElement>,
	source: PresentationScreenSource,
) {
	const fullscreen = useMediaFullscreen(
		rootRef,
		computed(() => source.media()),
	)
	const { isIdle } = useIdleControls(rootRef, {
		timeout: () => props.idleTimeout ?? 3000,
		canHide: ({ isKeyboard }) => source.isPlaying() && !isKeyboard,
	})
	const toSlide = (delta: number): void => (delta < 0 ? source.previous() : source.next())
	const noop = (): void => undefined

	useMediaHotkeys(rootRef, {
		isEnabled: () => Boolean(props.hasKeyboardShortcuts),
		seekStep: () => 1,
		seekStepLarge: () => 1,
		volumeStep: () => 0.05,
		actions: {
			togglePlay: source.togglePlay,
			seekBy: toSlide,
			seekToFraction: value => source.goTo(Math.floor(value * props.slides.length)),
			changeVolume: delta => source.setVolume(source.volume() + delta),
			toggleMute: source.toggleMute,
			toggleFullscreen: () => void fullscreen.toggle(),
			toggleTheater: noop,
			toggleCaptions: noop,
			nextEpisode: source.next,
			previousEpisode: source.previous,
			stepPlaybackRate: source.stepRate,
		},
	})

	return {
		isIdle,
		isFullscreen: fullscreen.isFullscreen,
		isFullscreenSupported: fullscreen.isSupported,
		toggleFullscreen: (): void => void fullscreen.toggle(),
	}
}
