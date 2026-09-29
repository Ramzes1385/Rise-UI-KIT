import type { BaseComponentProps } from '@composables/base/useBaseComponent'

export const AVATAR_SHAPES = ['circle', 'square'] as const

export const AVATAR_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

export interface BaseAvatarProps extends BaseComponentProps<
	(typeof AVATAR_VARIANTS)[number],
	'root' | 'content' | 'img' | 'initials' | 'online'
> {
	/** URL изображения или GIF. Если изображение не загрузилось, показываются инициалы из `name`. */
	src?: string
	/** Альтернативный текст изображения. Пустой (по умолчанию) — изображение декоративное, например когда имя написано рядом. */
	alt?: string
	/** Имя, из которого берутся инициалы (до двух букв). Без имени показывается «?». */
	name?: string
	/** Форма: `circle` — круг, `square` — квадрат со скруглением. */
	shape?: (typeof AVATAR_SHAPES)[number]
	/** Показывать точку статуса «в сети» в правом нижнем углу. */
	isOnline?: boolean
}

export interface BaseAvatarEmits {
	/** Событие клика по аватару */
	(event: 'click', payload: MouseEvent): void
}

export interface BaseAvatarSlots {
	/** Кастомный контент внутри аватара (заменяет изображение и инициалы) */
	default?: () => unknown
}
