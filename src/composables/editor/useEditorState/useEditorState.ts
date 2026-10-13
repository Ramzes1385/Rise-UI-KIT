/** Composable: состояние редактора (фокус, цвет текста/фона, пустой контент) */
import { ref } from 'vue'
import { formatColor, parseColor } from '@utils/data/colorUtils'
import type { UseEditorStateOptions } from './types/useEditorState.types'

/** Цвет текста в палитре, пока цвет области редактирования не определён (нет стилей); обычно берётся из стилей области */
const FALLBACK_TEXT_COLOR = '#000000'
/** Цвет фона (маркер), выбранный в палитре до первого выбора */
const DEFAULT_BG_COLOR = '#ffff00'
/** Содержимое без текста, которое всё равно считается непустым: изображение, видео, разделитель */
const MEDIA_SELECTOR = 'img, video, hr'

/** В области (или самой области) нет ни текста, ни медиа (изображение, видео, разделитель) */
function isContentEmpty(root: HTMLElement | null): boolean {
	return !root || (!root.textContent?.trim() && !root.querySelector(MEDIA_SELECTOR))
}

/** Реальный цвет текста области (в тёмной теме светлый) в формате HEX или null, если стили не определяют цвет */
function readTextColor(element: HTMLElement): string | null {
	const parsed = parseColor(getComputedStyle(element).color)
	return parsed ? formatColor({ ...parsed, a: 1 }, 'hex') : null
}

/** Цвет текста палитры: реальный цвет области, пока пользователь не выбрал свой */
function pickTextColor(editor: HTMLElement | null, current: string, isActive: boolean): string {
	return editor && !isActive ? (readTextColor(editor) ?? current) : current
}

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
	const textColor = ref(FALLBACK_TEXT_COLOR)
	const backgroundColor = ref(DEFAULT_BG_COLOR)
	const isTextColorActive = ref(false)
	const isBackgroundColorActive = ref(false)

	function checkEmpty(): void {
		isEmpty.value = isContentEmpty(editorRef.value)
	}

	function refreshTextColor(): void {
		textColor.value = pickTextColor(editorRef.value, textColor.value, isTextColorActive.value)
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
		refreshTextColor,
		handleTextColor,
		handleBackgroundColor,
		resetTextColor,
		resetBackgroundColor,
	}
}

export { useEditorState }
