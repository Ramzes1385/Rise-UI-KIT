import type { Ref } from 'vue'
import { computed, ref, watch } from 'vue'
import { UI_PLAYER } from '@/locales/messages'
import { useMediaShare } from './useMediaShare'
import { useMediaStats } from './useMediaStats'
import { formatMessage } from '@/locales/state'
import { useMediaGestures } from './useMediaGestures'
import { usePlaybackMemory } from './usePlaybackMemory'
import { useMediaContextMenu } from './useMediaContextMenu'
import { formatMediaTime, parseMediaTime } from './mediaTime'
import type { MediaState, MediaActions, MediaElementRef, MediaSourceItem } from '../types/MediaCore.types'
import type { MediaReportReason, BaseMediaPlayerEmits, MediaPlayerProps } from '../types/BaseMediaPlayer.types'

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

function useToolsMenu(tools: {
	isLoopOn: Ref<boolean>
	isReportOpen: Ref<boolean>
	share: ReturnType<typeof useMediaShare>
	stats: ReturnType<typeof useMediaStats>
}) {
	return useMediaContextMenu({
		isLoop: () => tools.isLoopOn.value,
		setLoop: isLoop => {
			tools.isLoopOn.value = isLoop
		},
		copyLink: () => void tools.share.copyLink(),
		copyLinkAtTime: () => void tools.share.copyLinkAtTime(),
		openReport: () => {
			tools.isReportOpen.value = true
		},
		toggleStats: tools.stats.toggleStats,
	})
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
	},
) {
	const { state, actions } = core
	const isLoopOn = useLoop(props)
	const isReportOpen = ref(false)
	const share = useMediaShare({ shareUrl: () => props.shareUrl, timeParam: () => props.timeParam, currentTime: () => state.currentTime })
	const stats = useMediaStats({ media: core.media, state, source: core.activeSource, audioSource: core.audioSource })
	const memory = usePlaybackMemory({
		state,
		actions,
		storageKey: () => (props.currentTime === undefined ? core.storageKey() : undefined),
		startTime: () => urlStartTime(props),
	})
	const gestures = useMediaGestures({ state, actions, seekStep: () => props.seekStepLarge, toggleFullscreen: core.toggleFullscreen })
	const menu = useToolsMenu({ isLoopOn, isReportOpen, share, stats })

	return {
		...share,
		...stats,
		...memory,
		...gestures,
		...menu,
		isLoopOn,
		isReportOpen,
		resumeText: computed(() => formatMessage(UI_PLAYER.RESUME, { time: formatMediaTime(memory.resumeTime.value ?? 0) })),
		seekHintText: computed(() =>
			formatMessage(UI_PLAYER.SECONDS, { n: `${gestures.seekHint.value?.side === 'left' ? '−' : '+'}${props.seekStepLarge}` }),
		),
		copyStats: () => void share.copyText(stats.statsText.value),
		submitReport(report: { reason: MediaReportReason; comment: string }): void {
			emit('report', {
				...report,
				time: state.currentTime,
				source: core.media.value?.currentSrc ?? '',
				details: stats.statsText.value,
			})
			share.flash(UI_PLAYER.REPORT_THANKS)
		},
	}
}
