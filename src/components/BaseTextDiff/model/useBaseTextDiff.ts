import { computed } from 'vue'
import { formatMessage } from '@/locales/state'
import { useUi } from '@composables/base/useUi'
import { UI_TEXT_DIFF } from '@/locales/messages'
import { diffLines, splitRows } from './diff/textDiff'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { TextDiffLine, BaseTextDiffProps } from '../types/BaseTextDiff.types'

const SIGNS = { equal: '', added: '+', removed: '−' } as const

export function useBaseTextDiff(props: BaseTextDiffProps) {
	const lines = computed(() => diffLines(props.before, props.after, props.isWordDiff ?? true))
	const counts = computed(() => ({
		added: lines.value.filter(line => line.type === 'added').length,
		removed: lines.value.filter(line => line.type === 'removed').length,
	}))
	return {
		...useStandardBaseComponent('base-text-diff', props, ['root', 'table']),
		ui: useUi(props, 'base-text-diff'),
		lines,
		rows: computed(() => splitRows(lines.value)),
		counts,
		hasChanges: computed(() => counts.value.added + counts.value.removed > 0),
		summary: computed(() =>
			formatMessage(UI_TEXT_DIFF.SUMMARY, { label: props.label, added: counts.value.added, removed: counts.value.removed }),
		),
		signOf: (line: TextDiffLine): string => SIGNS[line.type],
		changeText: (line?: TextDiffLine): string => {
			if (!line || line.type === 'equal') return ''
			return line.type === 'added' ? UI_TEXT_DIFF.ADDED : UI_TEXT_DIFF.REMOVED
		},
		cellClass: (line?: TextDiffLine): string => `base-text-diff__cell--${line?.type ?? 'empty'}`,
	}
}
