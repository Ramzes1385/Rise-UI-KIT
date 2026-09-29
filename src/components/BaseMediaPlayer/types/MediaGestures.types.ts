import type { MediaActions, MediaState } from './MediaCore.types'

export interface MediaGesturesOptions {
	state: Readonly<MediaState>
	actions: MediaActions
	/** Шаг перемотки двойным кликом, секунды */
	seekStep: () => number
	toggleFullscreen: () => void
}

/** Подсказка перемотки двойным кликом: сторона кадра и счётчик для перезапуска анимации */
export interface MediaSeekHint {
	side: 'left' | 'right'
	key: number
}
