import { UI_CODE } from '@/locales/messages'
import { useMarkdownUi } from './useMarkdownUi'
import { formatMessage } from '@/locales/state'
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
	let isUnmounted = false
	onBeforeUnmount(() => {
		isUnmounted = true
		clearTimeout(timer)
	})
	return {
		ui: useMarkdownUi(),
		isCopied,
		tokens: computed(() => tokenizeCode(props.block.value, props.block.lang)),
		copyLabel: computed(() => {
			const name = props.block.lang
			if (!name) return isCopied.value ? undefined : UI_CODE.COPY_LABEL
			return formatMessage(isCopied.value ? UI_CODE.COPIED_LABEL_NAMED : UI_CODE.COPY_LABEL_NAMED, { name })
		}),
		async copy(): Promise<void> {
			if (!(await writeClipboard(props.block.value)) || isUnmounted) return
			isCopied.value = true
			clearTimeout(timer)
			timer = setTimeout(() => {
				isCopied.value = false
			}, COPIED_DURATION)
		},
	}
}
