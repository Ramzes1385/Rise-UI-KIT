import type { PropsWithDefaults } from '@composables/useDefaults'
import type { BaseComponentProps } from '@composables/useBaseComponent'
import type { MediaActions, MediaPlayerError, MediaSourceItem, MediaState } from './MediaCore.types'

/** Вариант оформления один: панель управления лежит поверх кадра на тёмной подложке в обеих темах */
export const MEDIA_PLAYER_VARIANTS = ['default'] as const

export const MEDIA_PRELOAD_MODES = ['none', 'metadata', 'auto'] as const

/** Что загружать до запуска: ничего, только длительность и первый кадр или запись целиком */
export type MediaPreload = (typeof MEDIA_PRELOAD_MODES)[number]

export interface BaseMediaPlayerProps extends BaseComponentProps<
	(typeof MEDIA_PLAYER_VARIANTS)[number],
	'root' | 'media' | 'overlay' | 'controls' | 'seek' | 'volume' | 'time'
> {
	/**
	 * Источник: адрес или список с MIME. Играет первый источник, который поддерживает браузер (`canPlayType`).
	 * Абсолютные адреса — только со схемами из `allowedProtocols`.
	 */
	sources: MediaSourceItem[] | string
	/** Доступное имя плеера для скринридеров: название записи */
	title: string
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
	/** Горячие клавиши, пока фокус внутри плеера: Space/K, ←/→, J/L, Home/End, 0–9, ↑/↓, M, F, Shift+, и Shift+. */
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
}

export interface BaseMediaPlayerSlots {
	/** Своё сообщение об ошибке вместо текста и кнопки «Повторить» */
	error?: (props: { error: MediaPlayerError; retry: () => void }) => unknown
}

export interface BaseMediaPlayerExpose extends MediaActions {
	/** Состояние воспроизведения: позиция, длительность, пауза, громкость, ошибка */
	state: Readonly<MediaState>
	/** Медиаэлемент — для интеграций: аналитика, MSE; до монтирования null */
	getMediaElement: () => HTMLMediaElement | null
}

export type MediaPlayerProps = PropsWithDefaults<
	BaseMediaPlayerProps,
	'preload' | 'aspectRatio' | 'hasKeyboardShortcuts' | 'seekStep' | 'seekStepLarge' | 'volumeStep' | 'playbackRates' | 'idleTimeout'
>
