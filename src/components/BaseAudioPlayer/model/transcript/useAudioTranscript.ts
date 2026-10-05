import { formatMessage } from '@/locales/state'
import { UI_TRANSCRIPT } from '@/locales/messages'
import { downloadFile } from '@utils/media/fileUtils'
import { formatMediaTime } from '@utils/media/mediaUtils'
import { useTranscriptScroll } from './useTranscriptScroll'
import { useTranscriptSource } from './useTranscriptSource'
import { computed, nextTick, ref, useId, watch } from 'vue'
import type { BaseAudioPlayerEmits, BaseAudioPlayerProps } from '../../types/BaseAudioPlayer.types'
import { findCueIndex, splitMatches, transcriptFileName, transcriptToText } from './transcriptText'
import type { AudioTranscriptCue, AudioTranscriptItem, AudioTranscriptPlayback } from '../../types/AudioTranscript.types'

const TOGGLE = '.base-audio-player__transcript-toggle'

function useTranscriptOpen(props: BaseAudioPlayerProps, emit: BaseAudioPlayerEmits) {
	const isOpen = ref(props.isTranscriptOpen ?? false)
	watch(
		() => props.isTranscriptOpen,
		value => (isOpen.value = value ?? false),
	)
	const setOpen = (value: boolean): void => {
		isOpen.value = value
		emit('update:isTranscriptOpen', value)
	}
	return { isOpen, setOpen, toggle: (): void => setOpen(!isOpen.value) }
}

function useTranscriptItems(cues: () => AudioTranscriptCue[], playback: AudioTranscriptPlayback) {
	const query = ref('')
	const currentIndex = computed(() => findCueIndex(cues(), playback.currentTime()))
	const reference = computed(() => Math.max(playback.duration(), cues()[cues().length - 1]?.end ?? 0))
	const items = computed<AudioTranscriptItem[]>(() => {
		const needle = query.value.trim().toLocaleLowerCase()
		return cues()
			.filter(cue => !needle || `${cue.speaker}\n${cue.text}`.toLocaleLowerCase().includes(needle))
			.map(cue => ({
				...cue,
				time: formatMediaTime(cue.start, reference.value),
				speakerParts: splitMatches(cue.speaker, query.value),
				parts: splitMatches(cue.text, query.value),
				isCurrent: cue.index === currentIndex.value,
			}))
	})
	const resultText = computed(() => {
		if (!query.value.trim()) return ''
		return items.value.length ? formatMessage(UI_TRANSCRIPT.FOUND, { n: items.value.length }) : UI_TRANSCRIPT.NOT_FOUND
	})
	return { query, currentIndex, items, resultText }
}

export function useAudioTranscript(props: BaseAudioPlayerProps, emit: BaseAudioPlayerEmits, playback: AudioTranscriptPlayback) {
	const panelId = useId()
	const panelRef = ref<HTMLElement | null>(null)
	const { cues, status } = useTranscriptSource(() => props.transcript)
	const open = useTranscriptOpen(props, emit)
	const list = useTranscriptItems(() => cues.value, playback)
	const scroll = useTranscriptScroll({
		items: () => list.items.value,
		current: () => list.currentIndex.value,
		isOpen: () => open.isOpen.value,
	})
	const close = (): void => {
		const toggle = panelRef.value?.closest('.base-audio-player')?.querySelector<HTMLElement>(TOGGLE)
		open.setOpen(false)
		void nextTick(() => toggle?.focus())
	}
	return {
		...scroll,
		panelRef,
		transcriptId: panelId,
		hasTranscript: computed(() => Boolean(props.transcript?.trim())),
		isTranscriptOpen: open.isOpen,
		toggleTranscript: open.toggle,
		transcriptStatus: status,
		transcriptQuery: list.query,
		transcriptItems: list.items,
		transcriptResult: list.resultText,
		canDownloadTranscript: computed(() => cues.value.length > 0),
		chooseCue(item: AudioTranscriptItem): void {
			playback.seek(item.start)
			scroll.followCurrent()
		},
		downloadTranscript(): void {
			const text = transcriptToText(cues.value, playback.duration())
			const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }))
			downloadFile(url, transcriptFileName(props.title))
			setTimeout(() => URL.revokeObjectURL(url))
		},
		onPanelKeydown(event: KeyboardEvent): void {
			if (event.key !== 'Escape') return
			event.stopPropagation()
			close()
		},
	}
}
