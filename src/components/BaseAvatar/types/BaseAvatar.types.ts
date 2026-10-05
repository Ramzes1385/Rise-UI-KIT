import type { UiProp } from '@composables/base/useUi'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

export const AVATAR_SHAPES = ['circle', 'square'] as const

export const AVATAR_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

/**
 * Части аватара для пропа `ui` (БЭМ-элементы `.base-avatar__<часть>`, `root` — сам аватар):
 * content — круг или квадрат с содержимым, img — фото, initials — инициалы, online — точка «в сети», mascot — SVG-персонаж.
 */
export const AVATAR_PARTS = ['content', 'img', 'initials', 'online', 'mascot'] as const

export type BaseAvatarPart = (typeof AVATAR_PARTS)[number]

/** Обводка: `none` — без неё, `gradient` — радужная, `shimmer` — радужная и переливается (без движения при `prefers-reduced-motion`). */
export const AVATAR_RINGS = ['none', 'gradient', 'shimmer'] as const

/**
 * Персонаж вместо изображения — собственные персонажи кита, следят глазами за курсором:
 * `none` — нет, `sprout` — Росток, `cloud` — Облачко, `droplet` — Капля, `pebble` — Камешек, `spark` — Искра.
 */
export const AVATAR_MASCOTS = ['none', 'sprout', 'cloud', 'droplet', 'pebble', 'spark'] as const

/**
 * Настроение персонажа: `idle` — спокойное, `happy` — радость, `surprised` — удивление, `sad` — грусть,
 * `sleepy` — сонное, `thinking` — задумчивое. Рот, брови и глаза перетекают из одного настроения в другое.
 */
export const AVATAR_MOODS = ['idle', 'happy', 'surprised', 'sad', 'sleepy', 'thinking'] as const

export type AvatarMood = (typeof AVATAR_MOODS)[number]

export type AvatarMascotName = (typeof AVATAR_MASCOTS)[number]

/** Насколько зрачок смещается от центра глаза, в единицах `viewBox` персонажа. */
export const AVATAR_MASCOT_PUPIL_RANGE = 3

/** Расстояние от центра аватара в пикселях, на котором зрачок отходит до края глаза, а голова наклоняется до предела. */
export const AVATAR_MASCOT_REACH = 160

/** Где глаза персонажа: смещение по горизонтали от центра лица, в единицах `viewBox`. */
export const AVATAR_MASCOT_FACE_EYES = [-7, 7] as const

/** Наибольший наклон головы персонажа к курсору, в градусах. */
export const AVATAR_MASCOT_TILT = 4

/** Пауза между морганиями: от и до, в миллисекундах. */
export const AVATAR_MASCOT_BLINK_DELAY = [2500, 6000] as const

/** Сколько глаза остаются закрытыми при моргании, в миллисекундах. */
export const AVATAR_MASCOT_BLINK_HOLD = 110

/** Доля морганий, после которых сразу следует второе. */
export const AVATAR_MASCOT_DOUBLE_BLINK = 0.25

/** Параметры пружины: жёсткость и затухание при массе 1. */
export interface AvatarSpringConfig {
	/** Жёсткость: чем больше, тем быстрее значение догоняет цель */
	stiffness: number
	/** Затухание: чем больше, тем меньше перелёт и колебания */
	damping: number
}

/** Состояние пружины по одной оси. */
export interface AvatarSpringState {
	/** Текущее значение */
	value: number
	/** Скорость, единиц в секунду */
	velocity: number
}

/** Шаг пружины: сколько прошло времени и с какими параметрами. */
export interface AvatarSpringFrame {
	/** Время с прошлого кадра, в секундах */
	seconds: number
	/** Параметры пружины */
	config: AvatarSpringConfig
}

/** Куда стремится персонаж в текущем кадре. */
export interface AvatarMascotTargets {
	/** Смещение зрачков */
	pupil: AvatarPupilOffset
	/** Наклон головы, в градусах */
	tilt: number
	/** Насколько открыты глаза */
	eye: number
	/** Черты лица — числа кривых рта и бровей и видимость бровей */
	face: number[]
}

/** Состояние пружин персонажа. */
export interface AvatarMascotMotion {
	/** Зрачки по горизонтали */
	pupilX: AvatarSpringState
	/** Зрачки по вертикали */
	pupilY: AvatarSpringState
	/** Наклон головы */
	tilt: AvatarSpringState
	/** Открытость глаз */
	eye: AvatarSpringState
	/** Черты лица, по одной пружине на число */
	face: AvatarSpringState[]
}

/** Кадр общего тикера: возвращает `true`, пока персонажу нужно двигаться дальше. */
export type AvatarMascotTick = (seconds: number, pointer: AvatarPupilOffset | null) => boolean

/** Черты лица в одном настроении — координаты от центра между глазами, в единицах `viewBox`. */
export interface AvatarMoodShape {
	/** Рот — кубическая кривая: x1, y1, контрольные точки, x2, y2 (8 чисел) */
	mouth: readonly number[]
	/** Левая бровь — квадратичная кривая: x1, y1, контрольная точка, x2, y2 (6 чисел) */
	browLeft: readonly number[]
	/** Правая бровь — как левая */
	browRight: readonly number[]
	/** Видимость бровей, от 0 до 1 */
	browOpacity: number
	/** Насколько открыты глаза: 1 — обычно, меньше — прищур */
	eyeOpen: number
	/** Куда смотрят зрачки вместо курсора; без значения — следят за курсором */
	gaze?: AvatarPupilOffset
}

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
	/**
	 * URL изображения или GIF. Загруженное изображение плавно проявляется (`--rise-duration`; при выключенном движении — сразу).
	 * Если изображение не загрузилось, показываются инициалы из `name`.
	 */
	src?: string
	/** Альтернативный текст изображения. Пустой (по умолчанию) — изображение декоративное, например когда имя написано рядом. */
	alt?: string
	/** Имя, из которого берутся инициалы (до двух букв). Без имени показывается «?». */
	name?: string
	/** Форма: `circle` — круг, `square` — квадрат со скруглением. */
	shape?: (typeof AVATAR_SHAPES)[number]
	/** Показывать точку статуса «в сети» в правом нижнем углу. Смена статуса — с коротким «pop» на токенах движения. */
	isOnline?: boolean
	/** Обводка вокруг аватара: радужная (`gradient`) или переливающаяся (`shimmer`). Между обводкой и аватаром — зазор цвета фона. */
	ring?: (typeof AVATAR_RINGS)[number]
	/**
	 * Анимированный SVG-персонаж вместо изображения и инициалов. Глаза следят за курсором по всей странице;
	 * при `prefers-reduced-motion` персонаж смотрит прямо. Подпись для скринридеров — `alt`, как у изображения; пустой `alt` делает персонажа декоративным.
	 */
	mascot?: (typeof AVATAR_MASCOTS)[number]
	/** Только с `mascot`: персонаж плавно закрывает глаза — например, пока пользователь вводит пароль. */
	isEyesClosed?: boolean
	/** Только с `mascot`: персонаж моргает каждые 2,5–6 секунд, иногда дважды. При `prefers-reduced-motion` не моргает. */
	isBlinking?: boolean
	/** Только с `mascot`: настроение — рот, брови и глаза плавно перетекают при смене. Ненадолго — метод `react(mood, ms)`. */
	mood?: AvatarMood
	/** Выключенный аватар: `click` не приходит; с обработчиком `@click` — `aria-disabled="true"` и без фокуса */
	isDisabled?: boolean
	/**
	 * Классы частей аватара (`root`, `content`, `img`, `initials`, `online`, `mascot`) — добавляются к классам кита.
	 * Глобально — `createUiKitPlugin({ defaults: { BaseAvatar: { ui } } })`, классы плагина и экземпляра склеиваются.
	 *
	 * @example
	 * <BaseAvatar name="Анна Смирнова" :ui="{ root: 'shadow-lg', initials: 'tracking-wide' }" />
	 */
	ui?: UiProp<BaseAvatarPart>
}

export interface BaseAvatarEmits {
	/**
	 * Клик по аватару. С обработчиком аватар работает как кнопка: `role="button"`, фокус с Tab, Enter и Space
	 * вызывают тот же `click`; имя кнопки — `alt`, иначе `name`, иначе «Аватар» из словаря
	 */
	(event: 'click', payload: MouseEvent): void
}

export interface BaseAvatarExpose {
	/** Ненадолго показать настроение `mood` (по умолчанию на 1200 мс), затем вернуться к `mood` из пропсов. */
	react: (mood: AvatarMood, ms?: number) => void
}

/** Сколько длится реакция `react()` по умолчанию, в миллисекундах. */
export const AVATAR_MASCOT_REACT_MS = 1200

export interface BaseAvatarSlots {
	/** Кастомный контент внутри аватара (заменяет изображение и инициалы) */
	default?: () => unknown
}

export interface AvatarMascotProps {
	/** Персонаж */
	mascot: Exclude<AvatarMascotName, 'none'>
	/** Подпись персонажа для скринридеров; пустая — персонаж декоративный. */
	label?: string
	/** Персонаж закрывает глаза. */
	isEyesClosed?: boolean
	/** Персонаж моргает. */
	isBlinking?: boolean
	/** Настроение. */
	mood?: AvatarMood
}
