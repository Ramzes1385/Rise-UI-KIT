import type { BaseComponentProps } from '@/types/base.types'

/** Варианты отображения модального окна */
export const MODAL_VARIANTS = ['default', 'ghost', 'shadow'] as const

export type ModalVariant = (typeof MODAL_VARIANTS)[number]

/**
 * Режим fullScreen
 */
export type ModalFullScreen = 'width' | 'height' | 'both'

/**
 * Пропсы компонента BaseModal
 */
export interface BaseModalProps extends BaseComponentProps<ModalVariant> {
	/** Состояние открытия */
	isOpen: boolean
	/** Заголовок */
	title?: string
	/** Закрытие по клику на оверлей */
	closeOnOverlay?: boolean
	/** Режим fullScreen: по ширине, высоте или оба */
	fullScreen?: ModalFullScreen
	/** Режим ограничения внутри контейнера. Компонент рендерится на месте (без teleport), родитель должен иметь position: relative и overflow: hidden */
	isContained?: boolean
	/** Показывать затемнение фона за модалом */
	hasOverlay?: boolean
}

/**
 * События компонента BaseModal
 */
export interface BaseModalEmits {
	(event: 'update:isOpen', value: boolean): void
	(event: 'close'): void
	(event: 'confirm'): void
}

/**
 * Слоты компонента BaseModal
 */
export interface BaseModalSlots {
	default?: () => unknown
	/** Подвал модального окна */
	footer?: () => unknown
}
