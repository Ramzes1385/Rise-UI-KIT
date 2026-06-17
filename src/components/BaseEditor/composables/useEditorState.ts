import { ref, type Ref } from 'vue'
import { UI_EDITOR_DEFAULT_BG_COLOR, UI_EDITOR_DEFAULT_TEXT_COLOR } from '@constants'

/** Опции composable useEditorState */
interface UseEditorStateOptions {
	editorRef: Ref<HTMLDivElement | null>
	applyColor: (color: string) => void
	applyBackgroundColor: (color: string) => void
	resetColor: () => void
	resetBackgroundColor: () => void
}

/**
 * Состояние редактора, не зависящее от порядка инициализации тулбара:
 * фокус, признак пустого контента, активный цвет текста/фона и обработчики
 * применения/сброса цвета. Цветовые обработчики делегируют форматирование
 * функциям тулбара, переданным извне.
 */
function useEditorState({ editorRef, applyColor, applyBackgroundColor, resetColor: resetColorFn, resetBackgroundColor: resetBackgroundColorFn }: UseEditorStateOptions) {
	const isFocused = ref(false)
	const isEmpty = ref(true)
	const textColor = ref(UI_EDITOR_DEFAULT_TEXT_COLOR)
	const backgroundColor = ref(UI_EDITOR_DEFAULT_BG_COLOR)
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
