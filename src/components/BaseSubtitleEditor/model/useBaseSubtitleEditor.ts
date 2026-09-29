import { formatMessage } from '@/locales/state'
import { UI_SUBTITLES } from '@/locales/messages'
import { downloadFile } from '@utils/media/fileUtils'
import { formatCueTime, parseCueTime } from './cueTime'
import { formatMediaTime } from '@utils/media/mediaUtils'
import { computed, nextTick, reactive, ref, useId } from 'vue'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { SubtitleCue, SubtitleFormat } from '@utils/media/subtitleUtils'
import { decodeSubtitles, parseSubtitles, serializeSubtitles } from '@utils/media/subtitleUtils'
import type { BaseSubtitleEditorEmits, BaseSubtitleEditorProps } from '../types/BaseSubtitleEditor.types'

const FALLBACK_DURATION = 10

function sorted(cues: SubtitleCue[]): SubtitleCue[] {
	return [...cues].sort((a, b) => a.start - b.start)
}

function useCueEditing(props: BaseSubtitleEditorProps, emit: BaseSubtitleEditorEmits, idPrefix: string) {
	const drafts = reactive<Record<string, string>>({})
	const errors = reactive<Record<string, string>>({})
	const replace = (index: number, patch: Partial<SubtitleCue>): void =>
		emit('update:cues', sorted(props.cues.map((cue, position) => (position === index ? { ...cue, ...patch } : cue))))
	return {
		drafts,
		errors,
		timeValue: (index: number, edge: 'start' | 'end'): string => drafts[`${index}:${edge}`] ?? formatCueTime(props.cues[index][edge]),
		setDraft(index: number, edge: 'start' | 'end', value: string): void {
			drafts[`${index}:${edge}`] = value
		},
		commitTime(index: number, edge: 'start' | 'end'): void {
			const key = `${index}:${edge}`
			const time = drafts[key] === undefined ? props.cues[index][edge] : parseCueTime(drafts[key])
			const next = { ...props.cues[index], ...(time === null ? {} : { [edge]: time }) }
			delete errors[key]
			if (time === null) errors[key] = UI_SUBTITLES.INVALID_TIME
			else if (next.end < next.start) errors[key] = UI_SUBTITLES.ORDER_ERROR
			if (errors[key]) return
			delete drafts[key]
			replace(index, next)
		},
		updateText: (index: number, text: string): void => replace(index, { text }),
		remove(index: number): void {
			emit(
				'update:cues',
				props.cues.filter((_, position) => position !== index),
			)
		},
		async add(): Promise<void> {
			const start = props.currentTime ?? 0
			const cue = { start, end: start + (props.cueLength ?? 2), text: '' }
			const next = sorted([...props.cues, cue])
			emit('update:cues', next)
			await nextTick()
			document.getElementById(`${idPrefix}-text-${next.indexOf(cue)}`)?.focus()
		},
	}
}

function useCueFiles(props: BaseSubtitleEditorProps, emit: BaseSubtitleEditorEmits) {
	const fileInputRef = ref<HTMLInputElement | null>(null)
	return {
		fileInputRef,
		openFile: (): void => fileInputRef.value?.click(),
		async importFile(event: Event): Promise<void> {
			const input = event.target as HTMLInputElement
			const file = input.files?.[0]
			input.value = ''
			if (file) emit('update:cues', parseSubtitles(decodeSubtitles(await file.arrayBuffer())))
		},
		exportFile(format: SubtitleFormat): void {
			const text = serializeSubtitles(props.cues, format)
			const url = URL.createObjectURL(new Blob([text], { type: format === 'vtt' ? 'text/vtt' : 'application/x-subrip' }))
			downloadFile(url, `${props.fileName ?? 'subtitles'}.${format}`)
			URL.revokeObjectURL(url)
			emit('export', { format, text })
		},
	}
}

function useTimeline(props: BaseSubtitleEditorProps, emit: BaseSubtitleEditorEmits) {
	const length = computed(() => props.duration ?? Math.max(FALLBACK_DURATION, ...props.cues.map(cue => cue.end)))
	const share = (time: number): string => `${(Math.min(Math.max(time, 0), length.value) / length.value) * 100}%`
	const activeIndex = computed(() =>
		props.cues.findIndex(cue => (props.currentTime ?? 0) >= cue.start && (props.currentTime ?? 0) < cue.end),
	)
	return {
		activeIndex,
		playheadStyle: computed(() => ({ left: share(props.currentTime ?? 0) })),
		cueStyle: (cue: SubtitleCue) => ({ left: share(cue.start), width: share(Math.max(cue.end - cue.start, 0)) }),
		cueLabel: (cue: SubtitleCue, index: number): string =>
			formatMessage(UI_SUBTITLES.CUE, { n: index + 1, start: formatMediaTime(cue.start), end: formatMediaTime(cue.end) }),
		seekTimeline(event: MouseEvent): void {
			const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
			if (rect.width > 0) emit('update:currentTime', ((event.clientX - rect.left) / rect.width) * length.value)
		},
		goTo: (index: number): void => emit('update:currentTime', props.cues[index].start),
	}
}

export function useBaseSubtitleEditor(props: BaseSubtitleEditorProps, emit: BaseSubtitleEditorEmits) {
	const idPrefix = `base-subtitle-editor-${useId()}`
	return {
		...useStandardBaseComponent('base-subtitle-editor', props, ['root', 'timeline', 'cue', 'list']),
		...useCueEditing(props, emit, idPrefix),
		...useCueFiles(props, emit),
		...useTimeline(props, emit),
		idPrefix,
		label: (template: string, index: number): string => formatMessage(template, { n: index + 1 }),
		exportLabel: (format: SubtitleFormat): string => formatMessage(UI_SUBTITLES.EXPORT, { format }),
	}
}
