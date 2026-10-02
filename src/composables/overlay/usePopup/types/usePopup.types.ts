/**
 * Опции composable usePopup
 */
export interface UsePopupOptions {
	/** Открыт ли popup (геттер из внешнего состояния) */
	isOpen: () => boolean
	/** Закрытие по клику на оверлей */
	closeOnOverlay: () => boolean
	/**
	 * Закрытие по Escape. `false` — блокирующее окно: Escape его не закрывает и не достаётся слоям под ним
	 * (поповеру или меню, из которого окно открыто)
	 */
	closeOnEscape: () => boolean
	/** Callback при закрытии */
	onClose: () => void
	/** Блокировать скролл body при открытии (по умолчанию true) */
	lockScroll?: () => boolean
	/**
	 * Немодальное окно: Escape действует, только когда фокус внутри возвращённого элемента; иначе нажатие получает слой ниже.
	 * Не задано или вернуло `undefined` — Escape получает открытое окно, где бы ни был фокус
	 */
	escapeScope?: () => HTMLElement | null | undefined
}
