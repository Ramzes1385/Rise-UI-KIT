import { computed, onBeforeUnmount, ref } from 'vue'
import { tokenizeCode } from '@utils/data/codeHighlightUtils'
import type { MarkdownCodeProps } from '../types/MarkdownParts.types'

const COPIED_DURATION = 2000

function writeClipboard(text: string): Promise<boolean> {
	if (typeof navigator === 'undefined' || !navigator.clipboard) return Promise.resolve(false)
	return navigator.clipboard.writeText(text).then(
		() => true,
		() => false,
	)
}

export function useMarkdownCode(props: MarkdownCodeProps) {
	const isCopied = ref(false)
	let timer: ReturnType<typeof setTimeout> | undefined
	onBeforeUnmount(() => clearTimeout(timer))
	return {
		isCopied,
		tokens: computed(() => tokenizeCode(props.block.value, props.block.lang)),
		async copy(): Promise<void> {
			if (!(await writeClipboard(props.block.value))) return
			isCopied.value = true
			clearTimeout(timer)
			timer = setTimeout(() => {
				isCopied.value = false
			}, COPIED_DURATION)
		},
	}
}
