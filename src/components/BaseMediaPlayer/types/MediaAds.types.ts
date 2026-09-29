import type { Ref } from 'vue'
import type { MediaActions, MediaState, MediaElementRef } from './MediaCore.types'

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
}

export interface MediaAdBreak {
	/** Ключ рекламной паузы для статистики */
	id?: string
	/** Когда: `pre` — перед видео, `post` — после, число — на этой секунде записи */
	at: 'pre' | 'post' | number
	/** Объявления подряд */
	ads: MediaAdCreative[]
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
