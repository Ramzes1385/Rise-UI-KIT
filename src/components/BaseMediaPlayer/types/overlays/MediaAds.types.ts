import type { Ref } from 'vue'
import type { MediaActions, MediaState, MediaElementRef } from '../playback/MediaCore.types'

export const MEDIA_AD_EVENT_TYPES = ['start', 'complete', 'skip', 'click', 'error'] as const

/** Что произошло с рекламой: показ начался, досмотрена, пропущена, переход по ссылке, ошибка загрузки */
export type MediaAdEventType = (typeof MEDIA_AD_EVENT_TYPES)[number]

export interface MediaAdCreative {
	/** Ключ объявления для статистики */
	id?: string
	/** Ролик или картинка: относительный адрес или http:, https:, blob: (картинка — ещё и data:) */
	src: string
	/** MIME: `video/…` — ролик, `image/…` — картинка; без него картинка определяется по расширению */
	type?: string
	/** Сколько секунд показывать картинку; у ролика — его длина */
	duration?: number
	/** Сайт рекламодателя (http: или https:): «Перейти на сайт» и клик по объявлению */
	clickUrl?: string
	/** «Пропустить» — через столько секунд; без значения объявление не пропускается */
	skipAfter?: number
	/** Подпись рядом с меткой «Реклама»: рекламодатель или товар */
	title?: string
	/** Адреса трекинга (пиксели): у объявлений VAST заполняются из ответа сети */
	tracking?: MediaAdTracking
}

export const MEDIA_AD_TRACKING_EVENTS = [
	'impression',
	'start',
	'firstQuartile',
	'midpoint',
	'thirdQuartile',
	'complete',
	'skip',
	'click',
	'pause',
	'resume',
	'mute',
	'unmute',
	'error',
] as const

/** Событие трекинга VAST */
export type MediaAdTrackingEvent = (typeof MEDIA_AD_TRACKING_EVENTS)[number]

/**
 * Пиксели трекинга: GET-запросы при событиях объявления. Поддерживаются макросы [CACHEBUSTING], [TIMESTAMP],
 * [ERRORCODE] и [ADPLAYHEAD]
 */
export type MediaAdTracking = Partial<Record<MediaAdTrackingEvent, string[]>>

export interface MediaAdBreak {
	/** Ключ рекламной паузы для статистики */
	id?: string
	/** Когда: `pre` — перед видео, `post` — после, число — на этой секунде записи */
	at: 'pre' | 'post' | number
	/** Объявления подряд */
	ads?: MediaAdCreative[]
	/**
	 * Адрес VAST 3/4 рекламной сети: ответ загружается, когда подходит время паузы (без cookie, сервер отвечает с CORS).
	 * Поддерживаются InLine и Wrapper, линейные ролики и цепочки объявлений (`sequence`); VPAID и SIMID — нет
	 */
	vast?: string
}

/** Рекламная интеграция внутри ролика: отрезок на шкале и «Пропустить рекламу» */
export interface MediaAdSegment {
	/** Ключ интеграции для статистики */
	id?: string
	/** Начало, секунды */
	start: number
	/** Конец, секунды */
	end: number
	/** Подпись: рекламодатель или товар */
	title?: string
	/** «Пропустить рекламу» — через столько секунд от начала отрезка; по умолчанию сразу */
	skipAfter?: number
}

export interface MediaAdEvent {
	type: MediaAdEventType
	/** Объявление паузы или интеграция */
	ad: MediaAdCreative | MediaAdSegment
	/** Рекламная пауза объявления; у интеграции её нет */
	adBreak?: MediaAdBreak
}

/** Текущее объявление: номер паузы и номер объявления в ней */
export interface MediaAdPosition {
	breakIndex: number
	adIndex: number
}

export interface MediaAdsOptions {
	breaks: () => MediaAdBreak[] | undefined
	segments: () => MediaAdSegment[] | undefined
	state: Readonly<MediaState>
	actions: MediaActions
	media: MediaElementRef
	/** Элемент ролика объявления */
	adMedia: Readonly<Ref<HTMLVideoElement | null>>
	/** Сообщить о событии рекламы (`ad`) */
	emitAd: (event: MediaAdEvent) => void
}

/** Как загружать и выбирать ролики ответа VAST */
export interface MediaVastOptions {
	/** Загрузить XML по адресу */
	fetchXml: (url: string) => Promise<string>
	/** Браузер воспроизводит этот MIME */
	canPlay: (type: string) => boolean
	/** Ширина плеера в пикселях: выбирается ролик не меньше неё */
	width: number
	/** Сообщить об ошибке: адреса Error и код VAST */
	onError: (urls: string[], code: number) => void
	/** Сколько обёрток (Wrapper) можно пройти; по умолчанию 5 */
	maxDepth?: number
}

/** Файл ролика из MediaFiles */
export interface MediaVastFile {
	src: string
	type: string
	width: number
}

/** Разбор одного ответа VAST: глубина обёрток и трекинг, накопленный по цепочке */
export interface VastContext {
	depth: number
	inherited: MediaAdTracking
	options: MediaVastOptions
}
