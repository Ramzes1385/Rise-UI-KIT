import type { MediaState } from '../playback/MediaCore.types'

export const MEDIA_BANNER_POSITIONS = ['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const

/** Угол кадра с баннером */
export type MediaBannerPosition = (typeof MEDIA_BANNER_POSITIONS)[number]

export interface MediaBanner {
	/** Ключ баннера для событий */
	id: string
	/** Показать с этой секунды записи */
	start: number
	/** Скрыть на этой секунде; по умолчанию — через 10 с после начала */
	end?: number
	/** Текст баннера */
	text?: string
	/** Картинка: относительный адрес или http:, https:, blob:, data: */
	image?: string
	/** Ссылка (http: или https:), открывается в новой вкладке */
	href?: string
	/** Угол кадра; по умолчанию левый нижний */
	position?: MediaBannerPosition
	/** Кнопка «Закрыть»; по умолчанию есть */
	isClosable?: boolean
}

export const MEDIA_BANNER_EVENT_TYPES = ['show', 'click', 'close'] as const

export interface MediaBannerEvent {
	/** Показан, переход по ссылке или закрыт зрителем */
	type: (typeof MEDIA_BANNER_EVENT_TYPES)[number]
	banner: MediaBanner
}

export interface MediaAchievement {
	/** Ключ достижения: полученное не выдаётся повторно */
	id: string
	/** Название: «Первый шаг» */
	title: string
	/** Описание: «Посмотрите первую серию до конца» */
	description?: string
	/** Иконка: относительный адрес или http:, https:, blob:, data: */
	icon?: string
	/** Когда выдать: секунда записи, до которой зритель досмотрел, или `end` — после досмотра */
	at?: number | 'end'
}

export interface MediaBannersOptions {
	banners: () => MediaBanner[] | undefined
	state: Readonly<MediaState>
	emitBanner: (event: MediaBannerEvent) => void
}

export interface MediaAchievementsOptions {
	achievements: () => MediaAchievement[] | undefined
	/** Уже полученные достижения из props; без них — из браузера (localStorage) */
	earned: () => string[] | undefined
	state: Readonly<MediaState>
	emitAchievement: (achievement: MediaAchievement) => void
}

export interface MediaNoticesSlots {
	/** Своё содержимое баннера */
	banner?: (props: { banner: MediaBanner; close: () => void }) => unknown
}
