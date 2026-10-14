import { useCueKeys } from './useCueKeys'
import { formatMessage } from '@/locales/state'
import { useUi } from '@composables/base/useUi'
import { UI_SUBTITLES } from '@/locales/messages'
import { downloadFile } from '@utils/media/fileUtils'
import { formatCueTime, parseCueTime } from './cueTime'
import { formatMediaTime } from '@utils/media/mediaUtils'
import { computed, nextTick, reactive, ref, useId } from 'vue'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { SubtitleCue, SubtitleFormat } from '@utils/media/subtitleUtils'
import { decodeSubtitles, parseSubtitles, serializeSubtitles } from '@utils/media/subtitleUtils'
import type { BaseSubtitleEditorEmits, BaseSubtitleEditorProps, CueEntry } from '../types/BaseSubtitleEditor.types'

const FALLBACK_DURATION = 10

function sorted(entries: CueEntry[]): CueEntry[] {
	return [...entries].sort((a, b) => a.cue.start - b.cue.start)
}

function timeError(time: number | null, next: SubtitleCue): string | undefined {
	if (time === null) return UI_SUBTITLES.INVALID_TIME
	return next.end < next.start ? UI_SUBTITLES.ORDER_ERROR : undefined
}

function useAnnouncement() {
	const announcement = ref('')
	return {
		announcement,
		announce(text: string): void {
			announcement.value = ''
			void nextTick(() => {
				announcement.value = text
			})
		},
	}
}

function useCueEditing(props: BaseSubtitleEditorProps, emit: BaseSubtitleEditorEmits, cueKeys: ReturnType<typeof useCueKeys>) {
	const { announcement, announce } = useAnnouncement()
	const drafts = reactive<Record<string, string>>({})
	const errors = reactive<Record<string, string>>({})
	const fieldKey = (index: number, edge: 'start' | 'end'): string => `${cueKeys.keys.value[index]}:${edge}`
	const replace = (index: number, patch: Partial<SubtitleCue>): void =>
		emit(
			'update:cues',
			cueKeys.plan(
				sorted(
					cueKeys
						.entries()
						.map((entry, position) => (position === index ? { ...entry, cue: { ...entry.cue, ...patch } } : entry)),
				),
			),
		)
	return {
		announcement,
		drafts,
		errors,
		fieldError: (index: number, edge: 'start' | 'end'): string | undefined => errors[fieldKey(index, edge)],
		timeValue: (index: number, edge: 'start' | 'end'): string =>
			drafts[fieldKey(index, edge)] ?? formatCueTime(props.cues[index][edge]),
		setDraft(index: number, edge: 'start' | 'end', value: string): void {
			drafts[fieldKey(index, edge)] = value
		},
		commitTime(index: number, edge: 'start' | 'end'): void {
			const key = fieldKey(index, edge)
			const time = drafts[key] === undefined ? props.cues[index][edge] : parseCueTime(drafts[key])
			const next = { ...props.cues[index], ...(time === null ? {} : { [edge]: time }) }
			const error = timeError(time, next)
			delete errors[key]
			if (error) {
				errors[key] = error
				announce(`${formatMessage(edge === 'start' ? UI_SUBTITLES.START : UI_SUBTITLES.END, { n: index + 1 })}: ${error}`)
				return
			}
			announce('')
			delete drafts[key]
			replace(index, next)
		},
		updateText: (index: number, text: string): void => replace(index, { text }),
		remove(index: number): void {
			emit('update:cues', cueKeys.plan(cueKeys.entries().filter((_, position) => position !== index)))
		},
	}
}

function useCueAdding(
	props: BaseSubtitleEditorProps,
	emit: BaseSubtitleEditorEmits,
	{ cueKeys, idPrefix }: { cueKeys: ReturnType<typeof useCueKeys>; idPrefix: string },
) {
	return async (): Promise<void> => {
		const start = props.currentTime ?? 0
		const cue = { start, end: start + (props.cueLength ?? 2), text: '' }
		const next = cueKeys.plan(sorted([...cueKeys.entries(), { cue, key: cueKeys.newKey() }]))
		emit('update:cues', next)
		await nextTick()
		document.getElementById(`${idPrefix}-text-${next.indexOf(cue)}`)?.focus()
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
	const cueKeys = useCueKeys(() => props.cues)
	return {
		...useStandardBaseComponent('base-subtitle-editor', props, ['root', 'timeline', 'cue', 'list']),
		ui: useUi(props, 'base-subtitle-editor'),
		keys: cueKeys.keys,
		leavingCount: cueKeys.leavingCount,
		pinLeavingRow: cueKeys.pinLeavingRow,
		releaseLeavingRow: cueKeys.releaseLeavingRow,
		...useCueEditing(props, emit, cueKeys),
		add: useCueAdding(props, emit, { cueKeys, idPrefix }),
		...useCueFiles(props, emit),
		...useTimeline(props, emit),
		idPrefix,
		label: (template: string, index: number): string => formatMessage(template, { n: index + 1 }),
		exportLabel: (format: SubtitleFormat): string => formatMessage(UI_SUBTITLES.EXPORT, { format }),
	}
}
