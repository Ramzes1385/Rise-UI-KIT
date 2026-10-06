import { computed, ref, toRaw, watch } from 'vue'
import type { SubtitleCue } from '@utils/media/subtitleUtils'
import type { CueEntry } from '../types/BaseSubtitleEditor.types'

function useLeavingRows(keys: () => string[]) {
	const leavingCount = ref(0)
	watch(
		keys,
		(next, prev) => {
			const kept = new Set(next)
			leavingCount.value += prev.filter(key => !kept.has(key)).length
		},
		{ flush: 'pre' },
	)
	return {
		leavingCount,
		pinLeavingRow(element: Element): void {
			const row = element as HTMLElement
			Object.assign(row.style, { top: `${row.offsetTop}px`, left: `${row.offsetLeft}px`, width: `${row.offsetWidth}px` })
			row.setAttribute('aria-hidden', 'true')
		},
		releaseLeavingRow(): void {
			leavingCount.value = Math.max(leavingCount.value - 1, 0)
		},
	}
}

function matchKeys(list: SubtitleCue[], previous: CueEntry[], newKey: () => string): string[] {
	const byCue = new Map(previous.map(entry => [toRaw(entry.cue), entry.key]))
	const matched = list.map(cue => byCue.get(toRaw(cue)))
	const used = new Set(matched)
	return matched.map((key, index) => {
		if (key) return key
		const byIndex = previous[index]?.key
		const next = byIndex && !used.has(byIndex) ? byIndex : newKey()
		used.add(next)
		return next
	})
}

export function useCueKeys(cues: () => SubtitleCue[]) {
	let counter = 0
	let previous: CueEntry[] = []
	const planned = new WeakMap<SubtitleCue[], string[]>()
	const newKey = (): string => `cue-${counter++}`
	const keys = computed(() => {
		const list = cues()
		const next = planned.get(toRaw(list)) ?? matchKeys(list, previous, newKey)
		previous = list.map((cue, index) => ({ cue, key: next[index] }))
		return next
	})
	return {
		keys,
		newKey,
		...useLeavingRows(() => keys.value),
		entries: (): CueEntry[] => cues().map((cue, index) => ({ cue, key: keys.value[index] })),
		plan(entries: CueEntry[]): SubtitleCue[] {
			const list = entries.map(entry => entry.cue)
			planned.set(
				list,
				entries.map(entry => entry.key),
			)
			return list
		},
	}
}
