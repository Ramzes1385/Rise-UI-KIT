/** Composable: переход к сообщению чата — прокрутка ленты и подсветка */
import { onBeforeUnmount } from 'vue'
import { useReducedMotion } from '@composables/app/useReducedMotion'

/** Подсветка сообщения после перехода к нему, мс */
const HIGHLIGHT_DURATION_MS = 1500
const HIGHLIGHT_CLASS = 'base-chat-message-list__item--highlighted'

/**
 * Сдвиг ленты, при котором сообщение встаёт по центру видимой области (длинное — верхним краем к верху ленты).
 * Прокручивается только лента: scrollIntoView двигал бы и страницу, и панели вокруг чата.
 */
function centerOffset(container: HTMLElement, element: HTMLElement): number {
	const top = container.getBoundingClientRect().top + container.clientTop
	const rect = element.getBoundingClientRect()
	return rect.top - top - Math.max(0, (container.clientHeight - rect.height) / 2)
}

/** Подсветка сообщения после перехода к нему; переход к следующему снимает подсветку с предыдущего */
function useMessageHighlight(): (element: HTMLElement) => void {
	let current: { element: HTMLElement; timer: ReturnType<typeof setTimeout> } | null = null
	const clear = (): void => {
		if (!current) return
		clearTimeout(current.timer)
		current.element.classList.remove(HIGHLIGHT_CLASS)
		current = null
	}
	onBeforeUnmount(clear)
	return element => {
		clear()
		element.classList.add(HIGHLIGHT_CLASS)
		current = { element, timer: setTimeout(clear, HIGHLIGHT_DURATION_MS) }
	}
}

/**
 * Корень, в котором можно искать по id: документ или фрагмент (shadow root). Проверка по `nodeType`, а не `instanceof`:
 * у ленты в iframe, окне Document Picture-in-Picture или `window.open` свой `Document`, и `instanceof Document` дал бы false
 */
function isSearchRoot(node: Node): node is Document | DocumentFragment {
	return node.nodeType === Node.DOCUMENT_NODE || node.nodeType === Node.DOCUMENT_FRAGMENT_NODE
}

/**
 * Найти элемент сообщения `message-<id>` внутри ленты. id сообщений приходят из данных приложения и могут содержать
 * `.`, `:`, `$`, пробелы (Matrix, Firebase, составные ключи) — поэтому поиск по id, а не CSS-селектором. Ищется в корне
 * ленты (документ или shadow root), так что лента внутри веб-компонента или другого документа тоже работает
 */
function findMessageElement(container: HTMLElement, messageId: string): HTMLElement | null {
	const root = container.getRootNode()
	if (!isSearchRoot(root)) return null
	const element = root.getElementById(`message-${messageId}`)
	return element && container.contains(element) ? element : null
}

/** Описание: возвращает переход к сообщению по id — лента прокручивается так, чтобы сообщение встало по центру, и оно подсвечивается */
function useScrollToMessage(listRef: { value: HTMLElement | null }): (messageId: string) => void {
	const highlight = useMessageHighlight()
	const isReducedMotion = useReducedMotion()
	return messageId => {
		const container = listRef.value
		/* istanbul ignore next — defensive */
		if (!container) return
		const element = findMessageElement(container, messageId)
		if (!element) return

		container.scrollBy({ top: centerOffset(container, element), behavior: isReducedMotion.value ? 'auto' : 'smooth' })
		highlight(element)
	}
}

export { useScrollToMessage }
