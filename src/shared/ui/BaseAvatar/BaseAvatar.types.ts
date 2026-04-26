import type { CustomColor } from '@/shared/composables/useCustomColor'

/** Формы аватара */
export const AVATAR_SHAPES = ['circle', 'square'] as const

/** Варианты отображения аватара */
export const AVATAR_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

/**
 * Пропсы компонента BaseAvatar
 */
export interface BaseAvatarProps {
	/** URL изображения или GIF */
	src?: string
	/** Альтернативный текст */
	alt?: string
	/** Текст для генерации инициалов */
	name?: string
	/** Форма */
	shape?: (typeof AVATAR_SHAPES)[number]
	/** Вариант отображения */
	variant?: (typeof AVATAR_VARIANTS)[number]
	/** Онлайн-статус */
	isOnline?: boolean
	/** Масштаб размера (100 = 100%, 150 = 150%, 75 = 75%) */
	sizeScale?: number
	/** Кастомный цвет компонента */
	color?: CustomColor
}

/**
 * События компонента BaseAvatar
 */
export interface BaseAvatarEmits {
	/** Событие клика по аватару */
	(event: 'click'): void
}

/**
 * Слоты компонента BaseAvatar
 */
export interface BaseAvatarSlots {
	/** Кастомный контент внутри аватара (заменяет изображение и инициалы) */
	default?: () => unknown
}
