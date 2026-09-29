import { computed, ref } from 'vue'
import { useMediaPip } from './useMediaPip'
import { useMediaMenus } from './useMediaMenus'
import { UI_PLAYER, formatMessage } from './messages'
import { usePlayerContext } from './usePlayerContext'
import { useControlsLayout } from './useControlsLayout'
import type { MediaIconName } from '../types/MediaIcon.types'

const SEEK_LONG = 30

function volumeIcon(volume: number, isMuted: boolean): MediaIconName {
	if (isMuted || volume === 0) return 'volume-mute'
	return volume < 0.5 ? 'volume-low' : 'volume-high'
}

export function usePlayerControls() {
	const player = usePlayerContext()
	const isSeekRowOpen = ref(false)
	useControlsLayout(player.controlsRef, player.rootRef)
	return {
		...player,
		isSeekRowOpen,
		toggleSeekRow: (): void => {
			isSeekRowOpen.value = !isSeekRowOpen.value
		},
		...useMediaPip(player.mediaRef),
		...useMediaMenus({
			rate: () => player.state.playbackRate,
			qualities: () => player.qualities.value,
			activeQualityId: () => player.activeQualityId.value,
			selectQuality: player.selectQuality,
			audioOptions: () => player.audioOptions.value,
			activeAudioId: () => player.activeAudioId.value,
			selectAudio: player.selectAudioTrack,
			captionTracks: () => player.captionTracks.value,
			activeCaptionId: () => player.activeCaptionId.value,
			selectCaption: player.selectCaptionTrack,
			canLoadCaptions: () => Boolean(player.props.hasCaptionUpload),
			loadCaptions: player.openCaptionFile,
			captionStyle: () => player.captionStyle.value,
			updateCaptionStyle: player.updateCaptionStyle,
		}),
		volumeIcon: computed(() => volumeIcon(player.state.volume, player.state.isMuted)),
		seekSteps: computed(() => ({ short: player.props.seekStep, large: player.props.seekStepLarge, long: SEEK_LONG })),
		seekLabel: (seconds: number): string =>
			formatMessage(seconds < 0 ? UI_PLAYER.SEEK_BACK : UI_PLAYER.SEEK_FORWARD, { n: Math.abs(seconds) }),
		episodeCount: computed(() => (player.props.playlists ?? []).reduce((count, list) => count + list.episodes.length, 0)),
	}
}
