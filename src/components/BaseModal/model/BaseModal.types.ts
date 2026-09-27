import type { BaseComponentProps } from '../../../types/base.types'

/**
 * Варианты отображения модального окна:
 * default — рамка и тень; shadow — только тень, без рамки; ghost — без фона, рамки и тени (оформление даёт содержимое слота).
 */
export const MODAL_VARIANTS = ['default', 'ghost', 'shadow'] as const

export type ModalVariant = (typeof MODAL_VARIANTS)[number]

/**
 * Режим fullScreen
 */
export type ModalFullScreen = 'width' | 'height' | 'both'

/**
 * Пропсы компонента BaseModal
 */
export interface BaseModalProps extends BaseComponentProps<ModalVariant, 'root' | 'content' | 'header' | 'headerLeft' | 'title' | 'close' | 'body' | 'footer'> {
	/** Состояние открытия */
	isOpen: boolean
	/** Заголовок */
	title?: string
	/** Закрытие по клику на оверлей */
	closeOnOverlay?: boolean
	/** Растянуть окно на всю ширину, высоту или на весь экран (с отступом 16px от краёв) */
	fullScreen?: ModalFullScreen
	/**
	 * Окно внутри контейнера: рендерится на месте (без teleport) и перекрывает ближайшего родителя с position: relative.
	 * Такой диалог немодальный: без aria-modal, ловушки фокуса и блокировки прокрутки страницы.
	 */
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
