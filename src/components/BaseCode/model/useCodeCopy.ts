import { UI_CODE } from '@/locales/messages'
import { nextTick, onBeforeUnmount, ref } from 'vue'
import type { BaseCodeEmits, CodeProps } from '../types/BaseCode.types'

const COPIED_DURATION = 2000

function writeClipboard(text: string): Promise<boolean> {
	if (typeof navigator === 'undefined' || !navigator.clipboard) return Promise.resolve(false)
	return navigator.clipboard.writeText(text).then(
		() => true,
		() => false,
	)
}

export function useCodeCopy(props: CodeProps, emit: BaseCodeEmits) {
	const isCopied = ref(false)
	const status = ref('')
	let timer: ReturnType<typeof setTimeout> | undefined
	let isUnmounted = false

	onBeforeUnmount(() => {
		isUnmounted = true
		clearTimeout(timer)
	})

	async function announce(text: string): Promise<void> {
		status.value = ''
		await nextTick()
		status.value = text
	}

	async function copy(): Promise<boolean> {
		const code = props.code
		const success = await writeClipboard(code)
		emit('copy', { code, success })
		if (isUnmounted) return success
		clearTimeout(timer)
		isCopied.value = success
		await announce(success ? UI_CODE.COPY_DONE : UI_CODE.COPY_FAILED)
		timer = setTimeout(() => {
			isCopied.value = false
		}, COPIED_DURATION)
		return success
	}

	return { isCopied, status, copy }
}
