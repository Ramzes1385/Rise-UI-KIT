import type { CustomClassProp } from '@composables/useCustomClass'
import type { CustomColor } from '@composables/useCustomColor'

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
export interface BaseModalProps {
	/** Состояние открытия */
	isOpen: boolean
	/** Заголовок */
	title?: string
	/** Вариант отображения */
	variant?: ModalVariant
	/** Кастомный цвет компонента */
	color?: CustomColor
	/** Закрытие по клику на оверлей */
	closeOnOverlay?: boolean
	/** Режим fullScreen: по ширине, высоте или оба */
	fullScreen?: ModalFullScreen
	/** Масштаб размера (100 = 100%, 150 = 150%, 75 = 75%) */
	sizeScale?: number
	/** Режим ограничения внутри контейнера. Компонент рендерится на месте (без teleport), родитель должен иметь position: relative и overflow: hidden */
	isContained?: boolean
	/** Показывать затемнение фона за модалом */
	hasOverlay?: boolean
	/** Кастомные классы */
	customClass?: CustomClassProp
}

/**
 * События компонента BaseModal
 */
export interface BaseModalEmits {
	(event: 'update:isOpen', value: boolean): void
	(event: 'close'): void
	(event: 'confirm'): void
}
