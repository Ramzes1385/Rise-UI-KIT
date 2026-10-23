import { safeUrl } from '../playback/timeline'
import { computed, ref, shallowReactive, watch } from 'vue'
import type { SubtitleCue } from '@utils/media/subtitleUtils'
import { decodeSubtitles, parseSubtitles } from '@utils/media/subtitleUtils'
import type { PresentationCaptionsSource } from '../../types/PresentationModel.types'
import { activeCueText, cueLines } from '@components/BaseMediaPlayer/model/captions/subtitles'
import { MEDIA_CAPTION_PRESETS } from '@components/BaseMediaPlayer/types/content/MediaSubtitles.types'
import type { BasePresentationPlayerEmits, BasePresentationPlayerProps } from '../../types/BasePresentationPlayer.types'

async function fetchCues(src: string, credentials: 'include' | 'same-origin'): Promise<SubtitleCue[]> {
	const response = await fetch(src, { credentials })
	if (!response.ok) throw new Error(`HTTP ${response.status}`)
	return parseSubtitles(decodeSubtitles(await response.arrayBuffer()))
}

function useCueCache(props: BasePresentationPlayerProps) {
	const cache = shallowReactive(new Map<string, SubtitleCue[]>())
	const requests = new Set<string>()
	return {
		cache,
		async load(src: string): Promise<void> {
			if (cache.has(src) || requests.has(src)) return
			requests.add(src)
			try {
				cache.set(src, await fetchCues(src, props.crossorigin === 'use-credentials' ? 'include' : 'same-origin'))
			} catch {
				cache.set(src, [])
			} finally {
				requests.delete(src)
			}
		},
	}
}

export function usePresentationCaptions(
	props: BasePresentationPlayerProps,
	emit: BasePresentationPlayerEmits,
	source: PresentationCaptionsSource,
) {
	const cues = useCueCache(props)
	const isOn = ref(props.isCaptionsOn ?? true)
	const src = computed(() => (source.isShared() ? safeUrl(props.captions) : safeUrl(props.slides[source.index()]?.captions)))
	const hasCaptions = computed(() =>
		source.isShared() ? Boolean(safeUrl(props.captions)) : props.slides.some(slide => Boolean(safeUrl(slide.captions))),
	)
	watch(
		() => props.isCaptionsOn,
		value => {
			if (value !== undefined) isOn.value = value
		},
	)
	watch(
		[src, isOn],
		([url, on]) => {
			if (url && on) void cues.load(url)
		},
		{ immediate: true },
	)

	return {
		hasCaptions,
		captionBoxStyle: { left: `${MEDIA_CAPTION_PRESETS.bottom.x}%`, top: `${MEDIA_CAPTION_PRESETS.bottom.y}%` },
		isCaptionsOn: computed(() => isOn.value && hasCaptions.value),
		captionLines: computed(() => {
			const url = src.value
			if (!url || !isOn.value) return []
			return cueLines(activeCueText(cues.cache.get(url) ?? [], source.time()))
		}),
		toggleCaptions(): void {
			if (!hasCaptions.value) return
			isOn.value = !isOn.value
			emit('update:isCaptionsOn', isOn.value)
		},
	}
}
