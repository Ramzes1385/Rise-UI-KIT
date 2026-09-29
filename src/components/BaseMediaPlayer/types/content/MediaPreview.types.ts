import type { MediaSourceItem } from '../playback/MediaCore.types'
import type { MediaHlsConstructor } from '../playback/MediaHls.types'

/** Часть картинки-спрайта с миниатюрой: фрагмент `#xywh=` из файла WebVTT */
export interface MediaThumbnailArea {
	x: number
	y: number
	width: number
	height: number
}

/** Миниатюра из файла WebVTT: картинка (или её часть) для отрезка времени */
export interface MediaThumbnailCue {
	/** Начало отрезка, секунды */
	start: number
	/** Конец отрезка, секунды */
	end: number
	/** Адрес картинки без фрагмента */
	url: string
	/** Часть спрайта; без неё — картинка целиком */
	area?: MediaThumbnailArea
}

export interface MediaSeekPreviewOptions {
	/** Файл WebVTT с миниатюрами; с ним кадры из записи не нужны */
	thumbnails: () => string | undefined
	/** Источник кадров: запись в самом низком качестве */
	source: () => MediaSourceItem | null | undefined
	/** Кадры из самой записи разрешены */
	isEnabled: () => boolean
	/** Длительность записи: от неё зависит шаг кадров */
	duration: () => number
	/** Атрибут `crossorigin` основной записи */
	crossorigin: () => string | undefined
	/** Класс hls.js для кадров из потока .m3u8 */
	Hls: () => MediaHlsConstructor | undefined
	/** Настройки hls.js плеера */
	hlsConfig: () => Record<string, unknown> | undefined
}

export interface MediaSeekPreviewProps {
	/** Время под указателем, секунды */
	time: number
}
