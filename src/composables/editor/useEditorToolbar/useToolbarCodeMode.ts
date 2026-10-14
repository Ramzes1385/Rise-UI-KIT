/** Composable: переключение режима кода/HTML в редакторе и синхронизация содержимого */
import { nextTick, ref } from 'vue'
import { replaceCodeSelection, resolveCodeTextarea } from './helpers/codeText'
import type { UseToolbarCodeModeOptions } from './types/useToolbarCodeMode.types'

function useToolbarCodeMode(options: UseToolbarCodeModeOptions) {
	const { editorRef, codeTextareaRef, onInput, sanitize = (html: string) => html } = options

	const isCodeMode = ref(false)
	const codeContent = ref('')
	let entryHtml = ''

	function getCodeTextarea(): HTMLTextAreaElement | null {
		return resolveCodeTextarea(codeTextareaRef.value)
	}

	/** Заменяет выделение в поле кода и сообщает о вводе */
	function editCodeSelection(replace: (selected: string) => string): void {
		const el = getCodeTextarea()
		if (!el) return
		replaceCodeSelection(el, codeContent, replace)
		onInput()
	}

	function toggleCodeMode(): void {
		if (!isCodeMode.value) {
			if (!editorRef.value) return
			entryHtml = editorRef.value.innerHTML
			codeContent.value = entryHtml
			isCodeMode.value = true
			return
		}
		isCodeMode.value = false
		nextTick(() => {
			if (!editorRef.value) return
			editorRef.value.innerHTML = codeContent.value === entryHtml ? entryHtml : sanitize(codeContent.value)
			onInput()
		})
	}

	return {
		isCodeMode,
		codeContent,
		getCodeTextarea,
		wrapCodeSelection: (openTag: string, closeTag: string) => editCodeSelection(selected => openTag + selected + closeTag),
		insertCodeAtCursor: (html: string) => editCodeSelection(() => html),
		toggleCodeMode,
		handleCodeInput: (value: string) => {
			codeContent.value = value
			onInput()
		},
	}
}

export { useToolbarCodeMode }
