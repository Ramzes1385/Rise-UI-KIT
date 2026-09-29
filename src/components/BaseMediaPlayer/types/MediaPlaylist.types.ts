import type { MediaBanner } from './MediaNotices.types'
import type { MediaAudioTrackItem } from './MediaAudio.types'
import type { MediaTextTrackItem } from './MediaSubtitles.types'
import type { MediaAdBreak, MediaAdSegment } from './MediaAds.types'
import type { MediaState, MediaActions, MediaSourceItem } from './MediaCore.types'

export const MEDIA_CHAPTER_KINDS = ['intro', 'outro', 'recap'] as const

/** Отрезок, который можно пропустить: опенинг, эндинг, краткое содержание прошлых серий */
export type MediaChapterKind = (typeof MEDIA_CHAPTER_KINDS)[number]

export interface MediaChapter {
	/** Начало, секунды */
	start: number
	/** Конец, секунды; по умолчанию — начало следующей главы или конец записи */
	end?: number
	/** Название главы на шкале и в списке глав */
	title: string
	/** Отрезок с кнопкой «Пропустить» */
	kind?: MediaChapterKind
	/** Цвет отрезка на шкале; по умолчанию — из палитры плеера по порядку глав */
	color?: string
}

/** Глава с известным концом */
export interface MediaChapterRange extends MediaChapter {
	end: number
}

/**
 * Отдельный ролик до или после серии: заставка студии, титры с составом озвучки.
 * Играет поверх кадра с кнопкой «Пропустить», серия ждёт его окончания
 */
export interface MediaClip {
	/** Источники ролика — как `sources` плеера: файл, который браузер играет сам (MP4, WebM) */
	sources: MediaSourceItem[] | string
	/** Подпись над роликом; по умолчанию «Интро» или «Аутро» */
	title?: string
	/** «Пропустить» — через столько секунд; по умолчанию сразу */
	skipAfter?: number
}

export interface MediaEpisode {
	/** Ключ серии: значение `v-model:episode` */
	id: string
	/** Название: «Серия 1», «Пилот» */
	title: string
	/** Источники серии — как `sources` плеера */
	sources: MediaSourceItem[] | string
	/** Кадр до запуска */
	poster?: string
	/** Субтитры серии */
	tracks?: MediaTextTrackItem[]
	/** Озвучки серии */
	audioTracks?: MediaAudioTrackItem[]
	/** Главы серии: опенинг, эндинг, сюжетные части */
	chapters?: MediaChapter[]
	/** Рекламные паузы серии */
	adBreaks?: MediaAdBreak[]
	/** Рекламные интеграции серии */
	adSegments?: MediaAdSegment[]
	/** Баннеры серии */
	banners?: MediaBanner[]
	/** Интро перед серией; null — без интро, хотя оно задано у плейлиста или плеера */
	intro?: MediaClip | null
	/** Аутро после серии; null — без аутро */
	outro?: MediaClip | null
	/** Миниатюры для превью на шкале — как `thumbnails` плеера */
	thumbnails?: string
}

export interface MediaPlaylist {
	/** Ключ плейлиста */
	id: string
	/** Название: «Сезон 1», «OVA» */
	title: string
	episodes: MediaEpisode[]
	/** Интро перед каждой серией плейлиста */
	intro?: MediaClip | null
	/** Аутро после каждой серии плейлиста */
	outro?: MediaClip | null
}

/** Серия вместе с плейлистом, в котором она лежит */
export interface MediaEpisodeEntry {
	episode: MediaEpisode
	playlist: MediaPlaylist
}

export interface MediaPlaylistOptions {
	playlists: () => MediaPlaylist[] | undefined
	/** Выбранная серия из props; undefined — первая или выбранная зрителем */
	episode: () => string | undefined
	/** Сообщить о смене серии (`update:episode`) */
	emitEpisode: (id: string) => void
}

export interface MediaChaptersOptions {
	chapters: () => MediaChapter[] | undefined
	state: Readonly<MediaState>
}

export interface MediaNextCountdownOptions {
	/** Отсчёт в секундах; 0 — переход сразу */
	seconds: () => number
	/** Переходить к следующей серии сам */
	isEnabled: () => boolean
	/** Есть следующая серия */
	hasNext: () => boolean
	state: Readonly<MediaState>
	/** Перейти к следующей серии */
	playNext: () => void
	/** Отсчёт ждёт: идёт реклама после серии */
	isHeld?: () => boolean
}

/** Ролик до серии или после неё */
export type MediaClipKind = 'intro' | 'outro'

export interface MediaClipsOptions {
	intro: () => MediaClip | null | undefined
	outro: () => MediaClip | null | undefined
	/** Ключ содержимого: при смене серии ролики играют заново */
	contentKey: () => string | undefined
	state: Readonly<MediaState>
	actions: MediaActions
	/** Элемент основной записи: интро начинается по её событию `play` */
	media: Readonly<{ value: HTMLMediaElement | null }>
	/** Элемент ролика поверх кадра */
	clipMedia: Readonly<{ value: HTMLVideoElement | null }>
	/** Идёт реклама: ролики ждут её окончания */
	isAdPlaying: () => boolean
	/** Протоколы, разрешённые для источников */
	allowedProtocols: () => readonly string[]
}
