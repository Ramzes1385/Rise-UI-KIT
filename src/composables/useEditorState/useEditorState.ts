/** Composable: состояние редактора (фокус, цвет текста/фона, пустой контент) */
import { ref } from 'vue'
import type { UseEditorStateOptions } from './useEditorState.types'

/** Цвета текста и фона, выбранные в палитре до первого выбора */
const DEFAULT_TEXT_COLOR = '#000000'
const DEFAULT_BG_COLOR = '#ffff00'

/**
 * Состояние редактора, не зависящее от порядка инициализации тулбара:
 * фокус, признак пустого контента, активный цвет текста/фона и обработчики
 * применения/сброса цвета. Цветовые обработчики делегируют форматирование
 * функциям тулбара, переданным извне.
 */
function useEditorState({
	editorRef,
	applyColor,
	applyBackgroundColor,
	resetColor: resetColorFn,
	resetBackgroundColor: resetBackgroundColorFn,
}: UseEditorStateOptions) {
	const isFocused = ref(false)
	const isEmpty = ref(true)
	const textColor = ref(DEFAULT_TEXT_COLOR)
	const backgroundColor = ref(DEFAULT_BG_COLOR)
	const isTextColorActive = ref(false)
	const isBackgroundColorActive = ref(false)

	function checkEmpty(): void {
		/* istanbul ignore next -- defensive: editorRef всегда привязан после mount */
		if (!editorRef.value) return
		isEmpty.value = (editorRef.value.textContent ?? '').trim() === ''
	}

	function handleTextColor(color: string): void {
		applyColor(color)
		isTextColorActive.value = true
	}

	function handleBackgroundColor(color: string): void {
		applyBackgroundColor(color)
		isBackgroundColorActive.value = true
	}

	function resetTextColor(): void {
		resetColorFn()
		isTextColorActive.value = false
	}

	function resetBackgroundColor(): void {
		resetBackgroundColorFn()
		isBackgroundColorActive.value = false
	}

	return {
		isFocused,
		isEmpty,
		textColor,
		backgroundColor,
		isTextColorActive,
		isBackgroundColorActive,
		checkEmpty,
		handleTextColor,
		handleBackgroundColor,
		resetTextColor,
		resetBackgroundColor,
	}
}

export { useEditorState }
