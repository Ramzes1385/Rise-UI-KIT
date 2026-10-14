/** Утилиты: правка текста поля HTML-кода редактора по выделению */
import type { Ref } from 'vue'
import type { UseToolbarCodeModeOptions } from '../types/useToolbarCodeMode.types'

/**
 * Заменяет выделение в поле кода результатом replace(выделенный текст), ставит фокус в поле.
 * Правка идёт через `execCommand('insertText')` в самом поле: это единственный способ записать текст в нативную
 * историю поля, и Ctrl+Z отменяет обёртку тегами так же, как набор. Присваивание `value` стёрло бы историю.
 * Где поле не получило фокус (его держит диалог), команды нет или она отказала, текст ставится присваиванием, и такая правка не отменяется.
 * Возвращает `true`, если правку сделала команда: поле само сообщило о вводе событием `input`, и вызывающий не сообщает о ней второй раз.
 */
function replaceCodeSelection(el: HTMLTextAreaElement, content: Ref<string>, replace: (selected: string) => string): boolean {
	const start = el.selectionStart
	const end = el.selectionEnd
	const replacement = replace(content.value.substring(start, end))
	el.focus()
	el.setSelectionRange(start, end)
	if (
		document.activeElement === el &&
		typeof document.execCommand === 'function' &&
		document.execCommand('insertText', false, replacement)
	) {
		content.value = el.value
		return true
	}
	content.value = content.value.substring(0, start) + replacement + content.value.substring(end)
	return false
}

/** Поле textarea режима кода: сам элемент или textareaRef компонента поля */
function resolveCodeTextarea(ref: UseToolbarCodeModeOptions['codeTextareaRef']['value']): HTMLTextAreaElement | null {
	if (!ref) return null
	if (ref instanceof HTMLTextAreaElement) return ref
	if ('textareaRef' in ref && ref.textareaRef instanceof HTMLTextAreaElement) return ref.textareaRef
	return null
}

export { replaceCodeSelection, resolveCodeTextarea }
