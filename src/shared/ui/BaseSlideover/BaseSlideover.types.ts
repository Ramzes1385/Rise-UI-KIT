/**
 * Сторона появления slideover
 */
export type SlideoverSide = 'left' | 'right'

/**
 * Пропсы компонента BaseSlideover
 */
export interface BaseSlideoverProps {
	/** Состояние открытия */
	isOpen: boolean
	/** Заголовок */
	title?: string
	/** Сторона появления */
	side?: SlideoverSide
	/** Масштаб ширины панели (100 = 100%, 150 = 150%, 75 = 75%) */
	width?: number
	/** Полноэкранная панель */
	isFullWidth?: boolean
	/** Закрытие по клику на оверлей */
	closeOnOverlay?: boolean
	/** Закрытие по Escape */
	closeOnEscape?: boolean
}

/**
 * События компонента BaseSlideover
 */
export interface BaseSlideoverEmits {
	(event: 'update:isOpen', value: boolean): void
	(event: 'close'): void
}
