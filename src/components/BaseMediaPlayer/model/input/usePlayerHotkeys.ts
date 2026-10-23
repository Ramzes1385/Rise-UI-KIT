import type { Ref } from 'vue'
import { useMediaHotkeys } from './useMediaHotkeys'
import type { usePlayerCast } from '../cast/usePlayerCast'
import type { MediaPlayerProps } from '../../types/BaseMediaPlayer.types'
import type { MediaActions, MediaState } from '../../types/playback/MediaCore.types'

function nextRate(rates: number[], current: number, direction: 1 | -1): number | undefined {
	const sorted = [...rates].sort((a, b) => a - b)
	return direction > 0 ? sorted.find(rate => rate > current) : sorted.filter(rate => rate < current).pop()
}

export function usePlayerHotkeys(
	target: Readonly<Ref<HTMLElement | null>>,
	props: MediaPlayerProps,
	media: {
		state: Readonly<MediaState>
		actions: MediaActions
		screen: { toggleFullscreen: () => void }
		models: { toggleTheater: () => void }
		captions: { toggleCaptions: () => void }
		episodes: { playNext: () => void; playPrevious: () => void }
		ads: { isAdPlaying: Readonly<Ref<boolean>> }
		cast: Pick<ReturnType<typeof usePlayerCast>, 'isCastConnected' | 'castRemote' | 'castPlayOrPause' | 'castSeek'>
		isAudio: Readonly<Ref<boolean>>
	},
): void {
	const { state, actions, cast } = media
	const isCast = (): boolean => cast.isCastConnected.value
	const inVideo = (toggle: () => void) => (): void => (media.isAudio.value ? undefined : toggle())
	useMediaHotkeys(target, {
		isEnabled: () => props.hasKeyboardShortcuts && !media.ads.isAdPlaying.value,
		seekStep: () => props.seekStep,
		seekStepLarge: () => props.seekStepLarge,
		volumeStep: () => props.volumeStep,
		actions: {
			togglePlay: () => (isCast() ? cast.castPlayOrPause() : void actions.togglePlay()),
			seekBy: delta => (isCast() ? cast.castSeek(cast.castRemote.currentTime + delta) : actions.seekBy(delta)),
			seekToFraction: fraction =>
				isCast() ? cast.castSeek(cast.castRemote.duration * fraction) : actions.seek(state.duration * fraction),
			changeVolume: delta => actions.setVolume(state.volume + delta),
			toggleMute: actions.toggleMute,
			toggleFullscreen: inVideo(media.screen.toggleFullscreen),
			toggleTheater: inVideo(media.models.toggleTheater),
			toggleCaptions: media.captions.toggleCaptions,
			nextEpisode: media.episodes.playNext,
			previousEpisode: media.episodes.playPrevious,
			stepPlaybackRate(direction) {
				const rate = nextRate(props.playbackRates, state.playbackRate, direction)
				if (rate !== undefined) actions.setPlaybackRate(rate)
			},
		},
	})
}
