import type { Ref } from 'vue'
import { computed, ref, watch } from 'vue'
import { UI_PLAYER, formatMessage } from '../messages'
import { useMediaStats } from '../panels/useMediaStats'
import { useMediaShare } from '../sharing/useMediaShare'
import { useMediaGestures } from '../input/useMediaGestures'
import { usePlaybackMemory } from '../core/usePlaybackMemory'
import { useMediaContextMenu } from '../panels/useMediaContextMenu'
import { formatMediaTime, parseMediaTime } from '@utils/media/mediaUtils'
import type { MediaShareEvent } from '../../types/panels/MediaShare.types'
import type { MediaEventLogEntry } from '../../types/panels/MediaStatsPanel.types'
import type { MediaReportReason, BaseMediaPlayerEmits, MediaPlayerProps } from '../../types/BaseMediaPlayer.types'
import type { MediaState, MediaActions, MediaElementRef, MediaSourceItem } from '../../types/playback/MediaCore.types'

function urlStartTime(props: MediaPlayerProps): number | null {
	if (props.currentTime !== undefined || !props.hasUrlTime || typeof window === 'undefined') return null
	return parseMediaTime(new URL(window.location.href).searchParams.get(props.timeParam))
}

function useLoop(props: MediaPlayerProps) {
	const isLoopOn = ref(Boolean(props.isLoop))
	watch(
		() => props.isLoop,
		isLoop => {
			isLoopOn.value = Boolean(isLoop)
		},
	)
	return isLoopOn
}

function useToolsMenu(
	props: MediaPlayerProps,
	tools: {
		isLoopOn: Ref<boolean>
		isReportOpen: Ref<boolean>
		isShareOpen: Ref<boolean>
		share: ReturnType<typeof useMediaShare>
		stats: ReturnType<typeof useMediaStats>
	},
) {
	return useMediaContextMenu({
		isLoop: () => tools.isLoopOn.value,
		setLoop: isLoop => {
			tools.isLoopOn.value = isLoop
		},
		hasShare: () => Boolean(props.hasShare),
		openShare: () => {
			tools.isShareOpen.value = true
		},
		copyLink: () => void tools.share.copyLink(),
		copyLinkAtTime: () => void tools.share.copyLinkAtTime(),
		openReport: () => {
			tools.isReportOpen.value = true
		},
		toggleStats: tools.stats.toggleStats,
	})
}

function reportSender(
	emit: BaseMediaPlayerEmits,
	core: Parameters<typeof usePlayerTools>[2],
	tools: { share: ReturnType<typeof useMediaShare>; stats: ReturnType<typeof useMediaStats> },
) {
	return (report: { reason: MediaReportReason; comment: string }): void => {
		emit('report', {
			...report,
			time: core.state.currentTime,
			source: core.media.value?.currentSrc ?? '',
			details: tools.stats.statsReport(),
		})
		tools.share.flash(UI_PLAYER.REPORT_THANKS)
	}
}

function useCoreStats(core: Parameters<typeof usePlayerTools>[2]) {
	const { media, state, activeSource, audioSource, events } = core
	return useMediaStats({ media, state, source: activeSource, audioSource, events })
}

export function usePlayerTools(
	props: MediaPlayerProps,
	emit: BaseMediaPlayerEmits,
	core: {
		state: Readonly<MediaState>
		actions: MediaActions
		media: MediaElementRef
		activeSource: () => MediaSourceItem | null | undefined
		audioSource: () => string | null
		storageKey: () => string | undefined
		toggleFullscreen: () => void
		events: () => MediaEventLogEntry[]
	},
) {
	const { state, actions } = core
	const isLoopOn = useLoop(props)
	const isReportOpen = ref(false)
	const isShareOpen = ref(false)
	const share = useMediaShare({ shareUrl: () => props.shareUrl, timeParam: () => props.timeParam, currentTime: () => state.currentTime })
	const stats = useCoreStats(core)
	const memory = usePlaybackMemory({
		state,
		actions,
		storageKey: () => (props.currentTime === undefined ? core.storageKey() : undefined),
		startTime: () => urlStartTime(props),
	})
	const gestures = useMediaGestures({ state, actions, seekStep: () => props.seekStepLarge, toggleFullscreen: core.toggleFullscreen })
	const menu = useToolsMenu(props, { isLoopOn, isReportOpen, isShareOpen, share, stats })

	return {
		...share,
		...stats,
		...memory,
		...gestures,
		...menu,
		isLoopOn,
		isReportOpen,
		isShareOpen,
		toggleShare: (): void => {
			isShareOpen.value = !isShareOpen.value
		},
		emitShare: (data: MediaShareEvent): void => emit('share', data),
		resumeText: computed(() => formatMessage(UI_PLAYER.RESUME, { time: formatMediaTime(memory.resumeTime.value ?? 0) })),
		seekHintText: computed(() =>
			formatMessage(UI_PLAYER.SECONDS, { n: `${gestures.seekHint.value?.side === 'left' ? '−' : '+'}${props.seekStepLarge}` }),
		),
		copyStats: () => void share.copyText(stats.statsReport()),
		submitReport: reportSender(emit, core, { share, stats }),
	}
}
