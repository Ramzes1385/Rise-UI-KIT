import { computed, watch } from 'vue'
import { UI_PLAYER } from '../messages'
import type { MediaAdSegment, MediaAdsOptions } from '../../types/overlays/MediaAds.types'

const END_TOLERANCE = 0.5

export function useMediaAdSegments(options: Pick<MediaAdsOptions, 'segments' | 'state' | 'actions' | 'emitAd'>) {
	const { state } = options
	const segments = computed(() =>
		(options.segments() ?? []).filter(segment => segment.end > segment.start).sort((a, b) => a.start - b.start),
	)
	const active = computed(
		() => segments.value.find(segment => segment.start <= state.currentTime && state.currentTime < segment.end) ?? null,
	)
	let skipped: MediaAdSegment | null = null
	watch(active, (segment, previous) => {
		if (previous && previous !== skipped && state.currentTime >= previous.end - END_TOLERANCE)
			options.emitAd({ type: 'complete', ad: previous })
		skipped = null
		if (segment) options.emitAd({ type: 'start', ad: segment })
	})

	return {
		adSegments: segments,
		activeAdSegment: active,
		adSegmentLabel: computed(() => [UI_PLAYER.AD, active.value?.title].filter(Boolean).join(' · ')),
		adSegmentRanges: computed(() => segments.value.map(segment => [segment.start, segment.end] as const)),
		canSkipAdSegment: computed(() => active.value !== null && state.currentTime - active.value.start >= (active.value.skipAfter ?? 0)),
		skipAdSegment(): void {
			const segment = active.value
			if (!segment) return
			skipped = segment
			options.emitAd({ type: 'skip', ad: segment })
			options.actions.seek(segment.end)
		},
	}
}
