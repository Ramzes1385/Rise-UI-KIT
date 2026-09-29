import type { MediaHlsConstructor } from './MediaHls.types'
import type { MediaAudioTrackItem } from './MediaAudio.types'
import type { MediaTextTrackItem } from './MediaSubtitles.types'
import type { PropsWithDefaults } from '@composables/useDefaults'
import type { createPlayerContext } from '../model/useBaseMediaPlayer'
import type { BaseComponentProps } from '@composables/useBaseComponent'
import type { MediaChapter, MediaPlaylist } from './MediaPlaylist.types'
import type { MediaAdBreak, MediaAdEvent, MediaAdSegment } from './MediaAds.types'
import type { MediaBanner, MediaAchievement, MediaBannerEvent } from './MediaNotices.types'
import type { MediaActions, MediaPlayerError, MediaSourceItem, MediaState } from './MediaCore.types'

/** Вариант оформления один: панель управления лежит поверх кадра на тёмной подложке в обеих темах */
export const MEDIA_PLAYER_VARIANTS = ['default'] as const

export const MEDIA_PRELOAD_MODES = ['none', 'metadata', 'auto'] as const

export const MEDIA_LOGO_POSITIONS = ['top-left', 'top-right'] as const

/** Угол кадра с логотипом */
export type MediaLogoPosition = (typeof MEDIA_LOGO_POSITIONS)[number]

export const MEDIA_REPORT_REASONS = ['no-sound', 'no-video', 'buffering', 'out-of-sync', 'other'] as const

/** Причина жалобы зрителя: нет звука, нет изображения, тормозит, не совпадают субтитры или озвучка, другое */
export type MediaReportReason = (typeof MEDIA_REPORT_REASONS)[number]

export interface MediaReport {
	/** Что случилось */
	reason: MediaReportReason
	/** Комментарий зрителя */
	comment: string
	/** Позиция записи в момент отправки, секунды */
	time: number
	/** Адрес воспроизводимого источника */
	source: string
	/** Техническая информация плеера: строки «название: значение» */
	details: string
}

/** Что загружать до запуска: ничего, только длительность и первый кадр или запись целиком */
export type MediaPreload = (typeof MEDIA_PRELOAD_MODES)[number]

export interface BaseMediaPlayerProps extends BaseComponentProps<
	(typeof MEDIA_PLAYER_VARIANTS)[number],
	'root' | 'media' | 'overlay' | 'controls' | 'seek' | 'volume' | 'time' | 'title' | 'logo'
> {
	/**
	 * Источник: адрес или список с MIME. Играет первый источник, который поддерживает браузер (`canPlayType`).
	 * Абсолютные адреса — только со схемами из `allowedProtocols`. С `playlists` источники берутся из выбранной серии.
	 */
	sources?: MediaSourceItem[] | string
	/** Название записи: доступное имя плеера и подпись поверх кадра */
	title: string
	/** Показывать название поверх кадра вместе с панелью управления */
	hasTitle?: boolean
	/** Логотип в углу кадра: относительный адрес или http:, https:, blob:, data:; виден и при скрытой панели */
	logo?: string
	/** Текст логотипа для скринридера; без него логотип декоративный */
	logoAlt?: string
	/** Ссылка логотипа (http: или https:), открывается в новой вкладке */
	logoHref?: string
	/** Угол кадра с логотипом */
	logoPosition?: MediaLogoPosition
	/** Кадр до запуска: относительный адрес или http:, https:, blob:, data: */
	poster?: string
	/** Запустить без звука сразу после загрузки: браузеры разрешают автозапуск только без звука */
	isAutoplay?: boolean
	/** Начинать заново после окончания */
	isLoop?: boolean
	/** Что загружать до запуска */
	preload?: MediaPreload
	/** CORS-режим загрузки: нужен, если записи и субтитры лежат на другом домене */
	crossorigin?: 'anonymous' | 'use-credentials'
	/** Пропорции кадра — значение CSS `aspect-ratio` */
	aspectRatio?: string
	/** Горячие клавиши, пока фокус внутри плеера: Space/K, ←/→, J/L, Home/End, 0–9, ↑/↓, M, F, T, C, Shift+, и Shift+. */
	hasKeyboardShortcuts?: boolean
	/** Шаг перемотки стрелками ←/→, секунды */
	seekStep?: number
	/** Шаг перемотки J/L и PageUp/PageDown, секунды */
	seekStepLarge?: number
	/** Шаг громкости стрелками ↑/↓, от 0 до 1 */
	volumeStep?: number
	/** Скорости, между которыми переключают Shift+, и Shift+. (клавиши Б и Ю в русской раскладке) */
	playbackRates?: number[]
	/** Через сколько миллисекунд бездействия во время воспроизведения скрывается панель управления */
	idleTimeout?: number
	/** Разрешённые схемы адресов источников; по умолчанию http:, https:, blob: */
	allowedProtocols?: readonly string[]
	/** Позиция в секундах (`v-model:current-time`): обновляется не чаще 4 раз в секунду и сразу после перемотки */
	currentTime?: number
	/** Громкость от 0 до 1 (`v-model:volume`) */
	volume?: number
	/** Звук выключен (`v-model:is-muted`) */
	isMuted?: boolean
	/** Скорость воспроизведения (`v-model:playback-rate`) */
	playbackRate?: number
	/** Широкий экран (`v-model:is-theater`): раскладку страницы меняет приложение, плеер — свою кнопку и вид */
	isTheater?: boolean
	/** Ключ записи для запоминания позиции в браузере (localStorage): без него позиция не запоминается */
	storageKey?: string
	/** Ссылка для «Копировать ссылку»; по умолчанию — адрес страницы */
	shareUrl?: string
	/** Параметр адреса с позицией в секундах: `?t=754` */
	timeParam?: string
	/** Начать с позиции из адреса страницы (`timeParam`), если она там есть */
	hasUrlTime?: boolean
	/**
	 * Субтитры: файлы WebVTT (.vtt) или SubRip (.srt) в UTF-8, UTF-16 или Windows-1251.
	 * Файлы с другого домена загружаются по CORS: сервер должен отвечать заголовком Access-Control-Allow-Origin
	 */
	tracks?: MediaTextTrackItem[]
	/** Выбранные субтитры (`v-model:text-track`): `src` дорожки или null — выключены; без значения — дорожка с `isDefault` */
	textTrack?: string | null
	/** Зритель может добавить свой файл .srt или .vtt: пунктом меню или перетаскиванием на плеер */
	hasCaptionUpload?: boolean
	/**
	 * Озвучки отдельными аудиофайлами: играют синхронно с видео, переключаются с той же позиции.
	 * Пункт без `src` — звук самого видео. Без списка меню «Озвучка» показывает дорожки внутри файла, если их видит браузер
	 */
	audioTracks?: MediaAudioTrackItem[]
	/** Выбранная озвучка (`v-model:audio-track`): `src` дорожки, null — звук самого видео, `embedded:<id>` — дорожка внутри файла */
	audioTrack?: string | null
	/**
	 * Класс `Hls` из пакета hls.js для потоков .m3u8 там, где браузер не играет HLS сам (везде, кроме Safari):
	 * качество «Авто» и вручную, озвучки и субтитры потока. В ките hls.js нет — его подключает приложение
	 */
	hls?: MediaHlsConstructor
	/** Настройки hls.js: передаются в `new Hls(config)` */
	hlsConfig?: Record<string, unknown>
	/**
	 * Плейлисты (сезоны) с сериями. Источники, обложка, субтитры, озвучки и главы берутся из выбранной серии,
	 * если они у неё есть; позиция запоминается для каждой серии отдельно (`storageKey:<id серии>`)
	 */
	playlists?: MediaPlaylist[]
	/** Выбранная серия (`v-model:episode`): `id` серии; без значения — первая */
	episode?: string
	/** Главы записи: отрезки на шкале, список глав, «Пропустить опенинг» (у серии — свои главы) */
	chapters?: MediaChapter[]
	/** Переходить к следующей серии после окончания (`v-model:is-auto-next`); переключатель — в «Настройках» */
	isAutoNext?: boolean
	/** Отсчёт перед следующей серией, секунды; 0 — переход сразу */
	nextCountdown?: number
	/** Рекламные паузы: перед видео, на заданной секунде и после; ролики и картинки с «Пропустить через N с» */
	adBreaks?: MediaAdBreak[]
	/** Рекламные интеграции внутри ролика: отрезки на шкале и «Пропустить рекламу» */
	adSegments?: MediaAdSegment[]
	/** Баннеры поверх кадра в заданное время: текст, картинка, ссылка, угол, «Закрыть»; свой вид — слот `banner` */
	banners?: MediaBanner[]
	/** Достижения: выдаются, когда зритель досмотрел до секунды `at` или до конца; всплывают уведомлением один раз */
	achievements?: MediaAchievement[]
	/** Уже полученные достижения (например, с сервера); плеер ещё помнит полученные в браузере */
	earnedAchievements?: string[]
}

export interface BaseMediaPlayerEmits {
	/** Воспроизведение началось или продолжилось */
	(event: 'play'): void
	/** Воспроизведение остановлено, в том числе в конце записи */
	(event: 'pause'): void
	/** Запись доиграла до конца */
	(event: 'ended'): void
	/** Ошибка загрузки или запуска: код и исходная ошибка */
	(event: 'error', error: MediaPlayerError): void
	(event: 'update:currentTime', value: number): void
	(event: 'update:volume', value: number): void
	(event: 'update:isMuted', value: boolean): void
	(event: 'update:playbackRate', value: number): void
	(event: 'update:isTheater', value: boolean): void
	(event: 'update:textTrack', value: string | null): void
	(event: 'update:audioTrack', value: string | null): void
	(event: 'update:episode', value: string): void
	(event: 'update:isAutoNext', value: boolean): void
	/** Реклама: показ, досмотр, пропуск, переход по ссылке или ошибка — для статистики приложения */
	(event: 'ad', data: MediaAdEvent): void
	/** Баннер показан, по нему перешли или его закрыли */
	(event: 'banner', data: MediaBannerEvent): void
	/** Зритель получил достижение: приложение сохраняет его на сервере */
	(event: 'achievement', achievement: MediaAchievement): void
	/** Плеер развернулся на весь экран или свернулся */
	(event: 'fullscreen-change', isFullscreen: boolean): void
	/** Зритель отправил сообщение о проблеме: отправляет его приложение */
	(event: 'report', report: MediaReport): void
}

export interface BaseMediaPlayerSlots {
	/** Своё сообщение об ошибке вместо текста и кнопки «Повторить» */
	error?: (props: { error: MediaPlayerError; retry: () => void }) => unknown
	/** Своё содержимое баннера; `close` закрывает его */
	banner?: (props: { banner: MediaBanner; close: () => void }) => unknown
}

export interface BaseMediaPlayerExpose extends MediaActions {
	/** Состояние воспроизведения: позиция, длительность, пауза, громкость, ошибка */
	state: Readonly<MediaState>
	/** Медиаэлемент — для интеграций: аналитика, MSE; до монтирования null */
	getMediaElement: () => HTMLMediaElement | null
	/** Выдать достижение из `achievements` по ключу (например, по событию приложения) */
	awardAchievement: (id: string) => void
}

export type MediaPlayerProps = PropsWithDefaults<
	BaseMediaPlayerProps,
	| 'preload'
	| 'aspectRatio'
	| 'hasKeyboardShortcuts'
	| 'seekStep'
	| 'seekStepLarge'
	| 'volumeStep'
	| 'playbackRates'
	| 'idleTimeout'
	| 'hasTitle'
	| 'logoPosition'
	| 'timeParam'
	| 'hasUrlTime'
	| 'hasCaptionUpload'
	| 'nextCountdown'
>

/** Связь `v-model` плеера со значением медиаэлемента */
export interface PlayerModelSync<T> {
	/** Значение из props; undefined — плеер не управляется снаружи */
	prop: () => T | undefined
	/** Значение медиаэлемента */
	current: () => T
	/** Передать значение элементу */
	apply: (value: T) => void
	/** Сообщить новое значение элемента */
	emit: (value: T) => void
	isSame: (a: T, b: T) => boolean
	/** Не передавать значение из props при монтировании */
	skipOnMount?: () => boolean
}

/** Всё, что плеер отдаёт своим частям (панели управления): состояние, команды, подписи, меню */
export type MediaPlayerContext = ReturnType<typeof createPlayerContext>
