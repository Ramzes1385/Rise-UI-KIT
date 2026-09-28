import type { MediaSourceItem } from './MediaCore.types'

export interface MediaSettingsMenuProps {
	/** Скорости на выбор */
	rates: number[]
	/** Текущая скорость */
	rate: number
	/** Источники с подписью качества; меню качества появляется, когда их хотя бы два */
	qualities: MediaSourceItem[]
	/** Адрес текущего источника */
	activeSrc?: string
}

export interface MediaSettingsMenuEmits {
	/** Выбрана скорость */
	(event: 'select-rate', rate: number): void
	/** Выбрано качество */
	(event: 'select-quality', source: MediaSourceItem): void
}
