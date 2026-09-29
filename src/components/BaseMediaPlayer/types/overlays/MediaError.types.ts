import type { MediaPlayerError } from '../playback/MediaCore.types'

export const MEDIA_ERROR_EFFECTS = ['retro', 'aurora', 'noise', 'glitch', 'none'] as const

/**
 * Анимированный фон экрана ошибки: `retro` — ретро-сетка с солнцем, `aurora` — переливы, `noise` — помехи «нет сигнала»,
 * `glitch` — сбой картинки, `none` — просто затемнение
 */
export type MediaErrorEffect = (typeof MEDIA_ERROR_EFFECTS)[number]

/** Слой фона экрана ошибки */
export interface MediaErrorLayer {
	key: string
	className: string
}

export interface MediaErrorScreenSlots {
	/** Своё сообщение вместо стандартного; фон эффекта остаётся */
	default?: (props: { error: MediaPlayerError; retry: () => void }) => unknown
}
