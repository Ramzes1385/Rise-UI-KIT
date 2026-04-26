/**
 * Опции composable usePopup
 */
export interface UsePopupOptions {
	/** Открыт ли popup (геттер из внешнего состояния) */
	isOpen: () => boolean
	/** Закрытие по клику на оверлей */
	closeOnOverlay: () => boolean
	/** Закрытие по Escape */
	closeOnEscape: () => boolean
	/** Callback при закрытии */
	onClose: () => void
}
