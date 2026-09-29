import { onBeforeUnmount, ref } from 'vue'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { BaseAiMessageEmits, BaseAiMessageProps } from '../types/BaseAiMessage.types'

const COPIED_DURATION = 2000

function writeClipboard(text: string): Promise<boolean> {
	if (typeof navigator === 'undefined' || !navigator.clipboard) return Promise.resolve(false)
	return navigator.clipboard.writeText(text).then(
		() => true,
		() => false,
	)
}

export function useBaseAiMessage(props: BaseAiMessageProps, emit: BaseAiMessageEmits) {
	const isCopied = ref(false)
	let timer: ReturnType<typeof setTimeout> | undefined
	onBeforeUnmount(() => clearTimeout(timer))
	return {
		...useStandardBaseComponent('base-ai-message', props, ['root', 'body']),
		isCopied,
		async copy(): Promise<void> {
			const content = props.content ?? ''
			if (!(await writeClipboard(content))) return
			isCopied.value = true
			emit('copy', content)
			clearTimeout(timer)
			timer = setTimeout(() => {
				isCopied.value = false
			}, COPIED_DURATION)
		},
		retry: (): void => emit('retry'),
	}
}
