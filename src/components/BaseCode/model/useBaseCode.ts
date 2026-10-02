import { computed, ref } from 'vue'
import { useCodeCopy } from './useCodeCopy'
import { UI_CODE } from '@/locales/messages'
import { formatMessage } from '@/locales/state'
import type { BaseCodeEmits, CodeProps } from '../types/BaseCode.types'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import { useScrollableRegion } from '@composables/interaction/useScrollableRegion'
import { getCodeLanguageName, highlightCode } from '@utils/data/codeHighlightUtils'

export function useBaseCode(props: CodeProps, emit: BaseCodeEmits) {
	const base = useStandardBaseComponent('base-code', props, ['root', 'header', 'pre', 'line'])
	const preRef = ref<HTMLElement | null>(null)
	const { isScrollable } = useScrollableRegion({ elementRef: preRef, orientation: 'both' })
	const languageName = computed(() => getCodeLanguageName(props.language))
	const lines = computed(() =>
		highlightCode(props.code, props.language).map((tokens, index) => ({
			number: props.startLine + index,
			tokens,
			isHighlighted: props.highlightLines?.includes(props.startLine + index) ?? false,
		})),
	)
	const regionLabel = computed(() => {
		if (props.label) return props.label
		return languageName.value ? formatMessage(UI_CODE.LABEL_LANGUAGE, { language: languageName.value }) : UI_CODE.LABEL
	})
	const preStyle = computed(() => (props.maxHeight ? { maxHeight: `${props.maxHeight}px` } : undefined))
	const numberWidth = computed(() => ({ '--base-code-number-width': `${String(props.startLine + lines.value.length - 1).length}ch` }))

	return {
		...base,
		...useCodeCopy(props, emit),
		preRef,
		isScrollable,
		languageName,
		lines,
		isEmpty: computed(() => props.code === ''),
		regionLabel,
		preStyle,
		numberWidth,
	}
}
