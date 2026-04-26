import type { CustomColor } from '@/shared/composables/useCustomColor'

/** Варианты отображения карточки */
export const CARD_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

/**
 * Пропсы компонента BaseCard
 */
export interface BaseCardProps {
	/** Заголовок */
	title?: string
	/** Подзаголовок */
	subtitle?: string
	/** URL изображения */
	image?: string
	/** Альтернативный текст изображения */
	imageAlt?: string
	/** Интерактивная карточка */
	isHoverable?: boolean
	/** Вариант отображения */
	variant?: (typeof CARD_VARIANTS)[number]
	/** Кастомный цвет компонента */
	color?: CustomColor
	/** Масштаб размера (100 = 100%, 150 = 150%, 75 = 75%) */
	sizeScale?: number
	/** Включить прокрутку тела карточки */
	scroll?: boolean
}

/**
 * Привязки слотов компонента BaseCard
 */
export interface BaseCardSlotBindings {
	/** Масштаб размера */
	sizeScale: number
}

/**
 * Слоты компонента BaseCard
 */
export interface BaseCardSlots {
	default?: (props: BaseCardSlotBindings) => unknown
	header?: (props: BaseCardSlotBindings) => unknown
	footer?: (props: BaseCardSlotBindings) => unknown
	/** Контент поверх изображения */
	overlay?: (props: BaseCardSlotBindings) => unknown
	/** Действия в заголовке */
	actions?: (props: BaseCardSlotBindings) => unknown
}
