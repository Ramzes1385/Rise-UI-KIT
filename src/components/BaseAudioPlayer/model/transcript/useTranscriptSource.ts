import { ref, shallowRef, watch } from 'vue'
import { isSafeUrl } from '@utils/data/urlUtils'
import { isTranscriptText, toTranscriptCues } from './transcriptText'
import { decodeSubtitles, parseSubtitles } from '@utils/media/subtitleUtils'
import type { AudioTranscriptCue, AudioTranscriptStatus } from '../../types/AudioTranscript.types'

const PROTOCOLS = ['http:', 'https:', 'blob:', 'data:']

async function fetchTranscript(src: string, signal: AbortSignal): Promise<string> {
	const response = await fetch(src, { signal })
	if (!response.ok) throw new Error(`HTTP ${response.status}`)
	return decodeSubtitles(await response.arrayBuffer())
}

export function useTranscriptSource(source: () => string | undefined) {
	const cues = shallowRef<AudioTranscriptCue[]>([])
	const status = ref<AudioTranscriptStatus>('idle')
	const apply = (text: string): void => {
		cues.value = toTranscriptCues(parseSubtitles(text))
		status.value = 'ready'
	}
	watch(
		source,
		(value, _, onCleanup) => {
			cues.value = []
			const text = value?.trim() ?? ''
			if (!text) return void (status.value = 'idle')
			if (isTranscriptText(text)) return apply(text)
			if (!isSafeUrl(text, PROTOCOLS)) return void (status.value = 'error')
			const controller = new AbortController()
			onCleanup(() => controller.abort())
			status.value = 'loading'
			fetchTranscript(text, controller.signal).then(
				loaded => !controller.signal.aborted && apply(loaded),
				() => {
					if (!controller.signal.aborted) status.value = 'error'
				},
			)
		},
		{ immediate: true },
	)
	return { cues, status }
}
