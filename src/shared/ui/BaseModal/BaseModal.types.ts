import type { CustomColor } from '@/shared/composables/useCustomColor'

/** Варианты отображения модального окна */
export const MODAL_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

/**
 * Размер модального окна
 */
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'

/**
 * Режим fullScreen
 */
export type ModalFullScreen = 'width' | 'height' | 'both'

/**
 * Пропсы компонента BaseModal
 */
export interface BaseModalProps {
	/** Состояние открытия */
	isOpen: boolean
	/** Заголовок */
	title?: string
	/** Размер */
	size?: ModalSize
	/** Вариант отображения */
	variant?: (typeof MODAL_VARIANTS)[number]
	/** Кастомный цвет компонента */
	color?: CustomColor
	/** Закрытие по клику на оверлей */
	closeOnOverlay?: boolean
	/** Режим fullScreen: по ширине, высоте или оба */
	fullScreen?: ModalFullScreen
	/** Масштаб размера (100 = 100%, 150 = 150%, 75 = 75%) */
	sizeScale?: number
}

/**
 * События компонента BaseModal
 */
export interface BaseModalEmits {
	(event: 'update:isOpen', value: boolean): void
	(event: 'close'): void
	(event: 'confirm'): void
}
