import type { BaseComponentProps } from '@composables/base/useBaseComponent'

export const AVATAR_SHAPES = ['circle', 'square'] as const

export const AVATAR_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

/** Обводка: `none` — без неё, `gradient` — радужная, `shimmer` — радужная и переливается (без движения при `prefers-reduced-motion`). */
export const AVATAR_RINGS = ['none', 'gradient', 'shimmer'] as const

/** Персонаж вместо изображения: `none` — нет, `sprout` — Росток, собственный персонаж кита, следит глазами за курсором. */
export const AVATAR_MASCOTS = ['none', 'sprout'] as const

/** Насколько зрачок смещается от центра глаза, в единицах `viewBox` персонажа. */
export const AVATAR_MASCOT_PUPIL_RANGE = 3

/** Расстояние от центра аватара в пикселях, на котором зрачок отходит до края глаза. */
export const AVATAR_MASCOT_REACH = 160

export interface AvatarPupilOffset {
	/** Смещение по горизонтали, в единицах `viewBox` */
	x: number
	/** Смещение по вертикали, в единицах `viewBox` */
	y: number
}

export interface BaseAvatarProps extends BaseComponentProps<
	(typeof AVATAR_VARIANTS)[number],
	'root' | 'content' | 'img' | 'initials' | 'online' | 'mascot'
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
	/** Обводка вокруг аватара: радужная (`gradient`) или переливающаяся (`shimmer`). Между обводкой и аватаром — зазор цвета фона. */
	ring?: (typeof AVATAR_RINGS)[number]
	/**
	 * Анимированный SVG-персонаж вместо изображения и инициалов. Глаза следят за курсором по всей странице;
	 * при `prefers-reduced-motion` персонаж смотрит прямо. Подпись для скринридеров — `alt`, как у изображения; пустой `alt` делает персонажа декоративным.
	 */
	mascot?: (typeof AVATAR_MASCOTS)[number]
	/** Только с `mascot`: персонаж закрывает глаза — например, пока пользователь вводит пароль. */
	isEyesClosed?: boolean
}

export interface BaseAvatarEmits {
	/** Событие клика по аватару */
	(event: 'click', payload: MouseEvent): void
}

export interface BaseAvatarSlots {
	/** Кастомный контент внутри аватара (заменяет изображение и инициалы) */
	default?: () => unknown
}

export interface AvatarMascotProps {
	/** Подпись персонажа для скринридеров; пустая — персонаж декоративный. */
	label?: string
	/** Персонаж закрывает глаза. */
	isEyesClosed?: boolean
}
