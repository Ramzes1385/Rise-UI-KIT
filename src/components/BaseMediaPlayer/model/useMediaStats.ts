import { formatMediaTime } from './mediaTime'
import { UI_PLAYER } from '@/locales/messages'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { formatMessage, formatNumber } from '@/locales/state'
import type { MediaStatsRow } from '../types/MediaStatsPanel.types'
import type { MediaState, MediaElementRef, MediaSourceItem } from '../types/MediaCore.types'

const REFRESH_INTERVAL = 1000

const EMPTY = '—'

function bufferedAhead(state: Readonly<MediaState>): number {
	const range = state.buffered.find(([start, end]) => start <= state.currentTime && state.currentTime <= end)
	return range ? range[1] - state.currentTime : 0
}

function frames(media: HTMLVideoElement): string {
	const quality = media.getVideoPlaybackQuality?.()
	return quality
		? formatMessage(UI_PLAYER.STATS_FRAMES_VALUE, { dropped: quality.droppedVideoFrames, total: quality.totalVideoFrames })
		: EMPTY
}

function statsRows(media: HTMLVideoElement, state: Readonly<MediaState>, source: MediaSourceItem | null | undefined): MediaStatsRow[] {
	return [
		{ label: UI_PLAYER.STATS_SOURCE, value: media.currentSrc || EMPTY },
		{ label: UI_PLAYER.STATS_FORMAT, value: source?.type ?? EMPTY },
		{ label: UI_PLAYER.STATS_RESOLUTION, value: media.videoWidth ? `${media.videoWidth}×${media.videoHeight}` : EMPTY },
		{ label: UI_PLAYER.STATS_FRAMES, value: frames(media) },
		{
			label: UI_PLAYER.STATS_BUFFER,
			value: formatMessage(UI_PLAYER.SECONDS, { n: formatNumber(bufferedAhead(state), { maximumFractionDigits: 1 }) }),
		},
		{ label: UI_PLAYER.STATS_SPEED, value: `${formatNumber(state.playbackRate)}×` },
		{
			label: UI_PLAYER.STATS_VOLUME,
			value: formatNumber(state.isMuted ? 0 : state.volume, { style: 'percent', maximumFractionDigits: 0 }),
		},
		{
			label: UI_PLAYER.STATS_POSITION,
			value: `${formatMediaTime(state.currentTime, state.duration)} / ${formatMediaTime(state.duration)}`,
		},
		{ label: UI_PLAYER.STATS_STATE, value: `readyState ${media.readyState}, networkState ${media.networkState}` },
	]
}

export function useMediaStats(options: {
	media: MediaElementRef
	state: Readonly<MediaState>
	source: () => MediaSourceItem | null | undefined
}) {
	const isStatsOpen = ref(false)
	const tick = ref(0)
	let timer: ReturnType<typeof setInterval> | undefined
	watch(isStatsOpen, isOpen => {
		clearInterval(timer)
		if (isOpen)
			timer = setInterval(() => {
				tick.value++
			}, REFRESH_INTERVAL)
	})
	onBeforeUnmount(() => clearInterval(timer))
	const rows = computed(() => {
		const media = options.media.value as HTMLVideoElement | null
		return tick.value >= 0 && media ? statsRows(media, options.state, options.source()) : []
	})

	return {
		isStatsOpen,
		statsRows: rows,
		statsText: computed(() => rows.value.map(row => `${row.label}: ${row.value}`).join('\n')),
		toggleStats(): void {
			isStatsOpen.value = !isStatsOpen.value
		},
	}
}
