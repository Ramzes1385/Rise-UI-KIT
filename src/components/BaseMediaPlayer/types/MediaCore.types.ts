import type { Ref } from 'vue'

/** Ссылка на медиаэлемент: null до монтирования */
export type MediaElementRef = Readonly<Ref<HTMLMediaElement | null>>

export interface MediaSourceItem {
	/** Адрес: относительный путь или http:, https:, blob:; остальные схемы отбрасываются */
	src: string
	/** MIME с кодеками для canPlayType, например 'video/webm; codecs="vp9, opus"' */
	type?: string
	/** Подпись в меню качества, например «1080p» */
	label?: string
}

export const MEDIA_ERROR_CODES = ['aborted', 'network', 'decode', 'unsupported', 'autoplay-blocked', 'unknown'] as const

/** Причина ошибки: коды MediaError, запрет автозапуска браузером или неизвестная ошибка play() */
export type MediaErrorCode = (typeof MEDIA_ERROR_CODES)[number]

export interface MediaPlayerError {
	/** Причина ошибки */
	code: MediaErrorCode
	/** Исходная ошибка: MediaError элемента или DOMException из play() */
	cause?: unknown
}

/** Загруженный отрезок: начало и конец в секундах */
export type MediaTimeRange = readonly [start: number, end: number]

export interface MediaState {
	/** Текущая позиция, секунды */
	currentTime: number
	/** Длительность в секундах: NaN до загрузки метаданных, Infinity у прямой трансляции */
	duration: number
	/** Загруженные отрезки */
	buffered: MediaTimeRange[]
	/** На паузе, в том числе до первого запуска */
	isPaused: boolean
	/** Воспроизведение дошло до конца */
	isEnded: boolean
	/** Идёт перемотка */
	isSeeking: boolean
	/** Воспроизведение ждёт данных */
	isWaiting: boolean
	/** Громкость от 0 до 1 */
	volume: number
	/** Звук выключен */
	isMuted: boolean
	/** Скорость воспроизведения */
	playbackRate: number
	/** Последняя ошибка; сбрасывается повтором или новым запуском */
	error: MediaPlayerError | null
}

export interface MediaActions {
	/** Запустить; отказ браузера становится ошибкой в состоянии, а не исключением */
	play: () => Promise<void>
	/** Поставить на паузу */
	pause: () => void
	/** Запустить или поставить на паузу */
	togglePlay: () => Promise<void>
	/** Перейти к позиции в секундах; значение ограничивается длительностью */
	seek: (time: number) => void
	/** Сдвинуть позицию на delta секунд */
	seekBy: (delta: number) => void
	/** Громкость от 0 до 1; ненулевая громкость включает звук */
	setVolume: (volume: number) => void
	/** Выключить или включить звук */
	toggleMute: () => void
	/** Выключить (true) или включить (false) звук */
	setMuted: (isMuted: boolean) => void
	/** Скорость воспроизведения */
	setPlaybackRate: (rate: number) => void
	/** Загрузить источник заново и продолжить с той же позиции */
	retry: () => void
}

export interface MediaSourcesOptions {
	/** Источники: адрес или список с MIME и подписями качества */
	sources: () => MediaSourceItem[] | string | undefined
	/** Разрешённые схемы адресов; по умолчанию http:, https: и blob: */
	allowedProtocols?: () => readonly string[] | undefined
	/** Медиаэлемент: по его canPlayType выбирается первый воспроизводимый источник; до монтирования источник не выбирается */
	media: MediaElementRef
	/** Источник, который плеер воспроизводит сам, даже если браузер его не знает (HLS через hls.js) */
	canPlay?: (item: MediaSourceItem) => boolean
}

interface MediaHotkeyActions {
	togglePlay: () => void
	seekBy: (delta: number) => void
	/** Перейти к доле длительности: 0 — начало, 1 — конец */
	seekToFraction: (fraction: number) => void
	changeVolume: (delta: number) => void
	toggleMute: () => void
	toggleFullscreen: () => void
	/** Широкий экран или обычный режим */
	toggleTheater: () => void
	/** Включить или выключить субтитры */
	toggleCaptions: () => void
	/** Следующая серия */
	nextEpisode: () => void
	/** Предыдущая серия */
	previousEpisode: () => void
	/** Сменить скорость на соседнюю: 1 — быстрее, -1 — медленнее */
	stepPlaybackRate: (direction: 1 | -1) => void
}

export interface MediaHotkeysOptions {
	/** Горячие клавиши включены */
	isEnabled: () => boolean
	/** Шаг стрелок ←/→, секунды */
	seekStep: () => number
	/** Шаг J/L и PageUp/PageDown, секунды */
	seekStepLarge: () => number
	/** Шаг громкости стрелками ↑/↓, от 0 до 1 */
	volumeStep: () => number
	actions: MediaHotkeyActions
}

export interface IdleControlsOptions {
	/** Время бездействия до скрытия, мс */
	timeout: () => number
	/**
	 * Можно ли скрыть сейчас: например, идёт воспроизведение и меню закрыто.
	 * `isKeyboard` — последний ввод был с клавиатуры: фокус внутри панели держит её открытой только тогда
	 */
	canHide: (input: { isKeyboard: boolean }) => boolean
}

/** Медиаэлемент Safari на iOS: полноэкранный режим есть только у самого видео */
export type WebkitMediaElement = HTMLMediaElement & { webkitEnterFullscreen?: () => void }
