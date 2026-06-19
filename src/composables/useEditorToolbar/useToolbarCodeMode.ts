/** Composable: переключение режима кода/HTML в редакторе и синхронизация содержимого */
import { nextTick, ref } from 'vue'
import type { UseToolbarCodeModeOptions } from './useToolbarCodeMode.types'

/**
 * Composable для переключения режима кода/HTML в редакторе и синхронизации содержимого.
 */
function useToolbarCodeMode(options: UseToolbarCodeModeOptions) {
	const { editorRef, codeTextareaRef, onInput } = options

	const isCodeMode = ref(false)
	const codeContent = ref('')

	function getCodeTextarea(): HTMLTextAreaElement | null {
		const ref = codeTextareaRef.value
		if (!ref) return null
		if (ref instanceof HTMLTextAreaElement) return ref
		if ('textareaRef' in ref && ref.textareaRef instanceof HTMLTextAreaElement) return ref.textareaRef
		return null
	}

	function wrapCodeSelection(openTag: string, closeTag: string): void {
		const el = getCodeTextarea()
		if (!el) return
		const start = el.selectionStart
		const end = el.selectionEnd
		const selected = codeContent.value.substring(start, end)
		const before = codeContent.value.substring(0, start)
		const after = codeContent.value.substring(end)
		codeContent.value = before + openTag + selected + closeTag + after
		el.focus()
		onInput()
	}

	function insertCodeAtCursor(html: string): void {
		const el = getCodeTextarea()
		if (!el) return
		const pos = el.selectionStart
		const before = codeContent.value.substring(0, pos)
		const after = codeContent.value.substring(el.selectionEnd)
		codeContent.value = before + html + after
		el.focus()
		onInput()
	}

	function toggleCodeMode(): void {
		if (!isCodeMode.value) {
			if (!editorRef.value) return
			codeContent.value = editorRef.value.innerHTML
			isCodeMode.value = true
		} else {
			isCodeMode.value = false
			nextTick(() => {
				if (!editorRef.value) return
				editorRef.value.innerHTML = codeContent.value
				onInput()
			})
		}
	}

	function handleCodeInput(value: string): void {
		codeContent.value = value
		onInput()
	}

	return {
		isCodeMode,
		codeContent,
		getCodeTextarea,
		wrapCodeSelection,
		insertCodeAtCursor,
		toggleCodeMode,
		handleCodeInput,
	}
}

export { useToolbarCodeMode }
