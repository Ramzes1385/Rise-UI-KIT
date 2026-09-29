import type { MediaElementRef, MediaState } from './MediaCore.types'

export const MEDIA_CAPTION_COLORS = ['white', 'yellow', 'green', 'cyan'] as const

/** Цвет текста субтитров */
export type MediaCaptionColor = (typeof MEDIA_CAPTION_COLORS)[number]

export const MEDIA_CAPTION_BACKGROUNDS = ['none', 'semi', 'solid'] as const

/** Подложка субтитров: нет (обводка текста), полупрозрачная, чёрная */
export type MediaCaptionBackground = (typeof MEDIA_CAPTION_BACKGROUNDS)[number]

/** Размеры шрифта субтитров в процентах от обычного */
export const MEDIA_CAPTION_SIZES = [75, 100, 150, 200] as const

/** Готовые положения субтитров: центр блока в процентах кадра */
export const MEDIA_CAPTION_PRESETS = { bottom: { x: 50, y: 86 }, top: { x: 50, y: 12 } } as const

/** Готовое положение субтитров: внизу или вверху кадра */
export type MediaCaptionPreset = keyof typeof MEDIA_CAPTION_PRESETS

export interface MediaTextTrackItem {
	/** Адрес файла WebVTT (.vtt) или SubRip (.srt): относительный или http:, https:, blob:, data: */
	src: string
	/** Название в меню: «Русский», «English (SDH)» */
	label: string
	/** Язык реплик (BCP 47): `ru`, `en` */
	srclang?: string
	/** Включить при загрузке, если `textTrack` не задан */
	isDefault?: boolean
}

export interface MediaCue {
	/** Начало, секунды */
	start: number
	/** Конец, секунды */
	end: number
	/** Текст реплики; строки разделены переводом строки */
	text: string
}

/** Кусок строки реплики с оформлением из тегов <i>, <b>, <u> */
export interface MediaCueSegment {
	text: string
	isItalic: boolean
	isBold: boolean
	isUnderline: boolean
}

/** Точка на кадре в процентах: x — слева направо, y — сверху вниз */
export interface MediaCaptionPoint {
	x: number
	y: number
}

export interface MediaCaptionStyle {
	/** Размер шрифта в процентах от обычного */
	size: number
	color: MediaCaptionColor
	background: MediaCaptionBackground
	/** Центр блока субтитров в процентах кадра */
	position: MediaCaptionPoint
}

/** Дорожка субтитров в меню: адрес дорожки из `tracks` или `file:<имя>` для файла зрителя */
export interface MediaCaptionOption {
	id: string
	label: string
}

/** Перетаскивание блока субтитров: откуда начали и в каких границах двигать */
export interface MediaCaptionDrag {
	/** Указатель в начале, пиксели окна */
	pointer: MediaCaptionPoint
	/** Положение блока в начале, проценты кадра */
	origin: MediaCaptionPoint
	/** Размер кадра, пиксели */
	area: { width: number; height: number }
	/** Половина размера блока, проценты кадра: блок не выходит за край */
	half: MediaCaptionPoint
}

/** Передавать ли cookie при загрузке файлов субтитров: `include` — при `crossorigin="use-credentials"` */
export type MediaFetchCredentials = 'include' | 'same-origin'

export interface MediaSubtitlesOptions {
	/** Дорожки из props */
	tracks: () => MediaTextTrackItem[] | undefined
	/** Выбранная дорожка из props: undefined — не задана, null — выключены */
	textTrack: () => string | null | undefined
	state: Readonly<Pick<MediaState, 'currentTime' | 'isPaused'>>
	media: MediaElementRef
	credentials: () => MediaFetchCredentials
	/** Короткое сообщение поверх кадра */
	flash: (message: string) => void
	/** Сообщить о смене дорожки (`update:textTrack`) */
	emitTrack: (id: string | null) => void
}

export interface MediaCaptionFilesOptions {
	isEnabled: () => boolean
	root: Readonly<{ value: HTMLElement | null }>
	load: (file: File) => Promise<void>
	flash: (message: string) => void
}
