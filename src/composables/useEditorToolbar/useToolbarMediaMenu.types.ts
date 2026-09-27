export interface UseToolbarMediaMenuOptions {
	onInput: () => void
	/** Режим только для чтения: меню медиа не открывается, изменение и удаление медиа запрещены */
	isReadonly?: () => boolean
}
