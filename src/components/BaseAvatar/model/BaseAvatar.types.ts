import type { BaseComponentProps } from '../../../types/base.types'

/** Формы аватара */
export const AVATAR_SHAPES = ['circle', 'square'] as const

/** Варианты отображения аватара */
export const AVATAR_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

/**
 * Пропсы компонента BaseAvatar
 */
export interface BaseAvatarProps extends BaseComponentProps<(typeof AVATAR_VARIANTS)[number]> {
	/** URL изображения или GIF */
	src?: string
	/** Альтернативный текст */
	alt?: string
	/** Текст для генерации инициалов */
	name?: string
	/** Форма */
	shape?: (typeof AVATAR_SHAPES)[number]
	/** Онлайн-статус */
	isOnline?: boolean
}

/**
 * События компонента BaseAvatar
 */
export interface BaseAvatarEmits {
	/** Событие клика по аватару */
	(event: 'click', payload: MouseEvent): void
}

/**
 * Слоты компонента BaseAvatar
 */
export interface BaseAvatarSlots {
	/** Кастомный контент внутри аватара (заменяет изображение и инициалы) */
	default?: () => unknown
}
