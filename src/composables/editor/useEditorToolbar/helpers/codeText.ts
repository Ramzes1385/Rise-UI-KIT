/** Утилиты: правка текста поля HTML-кода редактора по выделению */
import type { Ref } from 'vue'
import type { UseToolbarCodeModeOptions } from '../types/useToolbarCodeMode.types'

/** Заменяет выделение в поле кода результатом replace(выделенный текст), ставит фокус в поле */
function replaceCodeSelection(el: HTMLTextAreaElement, content: Ref<string>, replace: (selected: string) => string): void {
	const start = el.selectionStart
	const end = el.selectionEnd
	const selected = content.value.substring(start, end)
	content.value = content.value.substring(0, start) + replace(selected) + content.value.substring(end)
	el.focus()
}

/** Поле textarea режима кода: сам элемент или textareaRef компонента поля */
function resolveCodeTextarea(ref: UseToolbarCodeModeOptions['codeTextareaRef']['value']): HTMLTextAreaElement | null {
	if (!ref) return null
	if (ref instanceof HTMLTextAreaElement) return ref
	if ('textareaRef' in ref && ref.textareaRef instanceof HTMLTextAreaElement) return ref.textareaRef
	return null
}

export { replaceCodeSelection, resolveCodeTextarea }
