import { computed } from 'vue'
import { provideMarkdownUi } from './useMarkdownUi'
import { parseMarkdown, withCaret } from './markdownDocument'
import type { BaseMarkdownProps } from '../types/BaseMarkdown.types'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'

export function useBaseMarkdown(props: BaseMarkdownProps) {
	return {
		...useStandardBaseComponent('base-markdown', props, ['root']),
		ui: provideMarkdownUi(props),
		blocks: computed(() => {
			const blocks = parseMarkdown(props.source ?? '', props.hasLineBreaks)
			return props.isStreaming ? withCaret(blocks) : blocks
		}),
	}
}
