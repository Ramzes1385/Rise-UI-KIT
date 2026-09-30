import type { MediaElementRef, MediaSourceItem } from './MediaCore.types'

/** Уровень качества потока hls.js */
export interface MediaHlsLevel {
	height?: number
	bitrate?: number
	name?: string
}

/** Звуковая дорожка потока hls.js */
export interface MediaHlsTrack {
	name?: string
	lang?: string
}

/** Данные события ошибки hls.js */
export interface MediaHlsErrorData {
	fatal: boolean
	type: string
	details?: string
}

/** Экземпляр hls.js: только то, чем пользуется плеер */
export interface MediaHlsInstance {
	readonly levels: MediaHlsLevel[]
	/** Уровень качества: -1 — автоматический выбор */
	currentLevel: number
	readonly autoLevelEnabled: boolean
	readonly audioTracks: MediaHlsTrack[]
	audioTrack: number
	/** Показывать субтитры средствами браузера: плеер выводит их сам */
	subtitleDisplay: boolean
	loadSource(src: string): void
	attachMedia(media: HTMLMediaElement): void
	startLoad(): void
	recoverMediaError(): void
	destroy(): void
	on(event: string, listener: (event: string, data: MediaHlsErrorData) => void): void
}

/** Класс `Hls` из пакета hls.js, который передаёт приложение */
export interface MediaHlsConstructor {
	new (...args: never[]): MediaHlsInstance
	isSupported(): boolean
}

/** Качество в меню: адрес файла, `auto` или `hls:<номер уровня>` */
export interface MediaQualityOption {
	id: string
	label: string
	/** Короткий текст на кнопке «Качество», если он короче подписи: у файлового «Авто» — текущее разрешение */
	text?: string
}

export interface MediaHlsOptions {
	/** Класс hls.js из props */
	Hls: () => MediaHlsConstructor | undefined
	/** Настройки hls.js из props */
	config: () => Record<string, unknown> | undefined
	media: MediaElementRef
	/** Выбранный источник */
	source: () => MediaSourceItem | null | undefined
}
