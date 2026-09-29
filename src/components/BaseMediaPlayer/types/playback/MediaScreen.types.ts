import type { Ref } from 'vue'
import type { MediaElementRef, MediaState } from './MediaCore.types'

export interface MediaMiniOptions {
	/** Корень плеера: его место на странице — точка отсчёта «прокручен за экран» */
	root: Readonly<Ref<HTMLElement | null>>
	/** Мини-плеер включён (`has-mini-player`) */
	isEnabled: () => boolean
	isFullscreen: () => boolean
	state: Readonly<MediaState>
	/** Поставить запись на паузу — при закрытии мини-плеера */
	pause: () => void
}

/** Поворот картинки, градусы по часовой стрелке */
export type MediaRotation = 0 | 90 | 180 | 270

export interface MediaRotationOptions {
	media: MediaElementRef
	isFullscreen: () => boolean
}

export interface MediaAmbientOptions {
	media: MediaElementRef
	state: Readonly<MediaState>
}

/** Карточка серии в панели серий */
export interface MediaEpisodeCard {
	id: string
	/** Номер серии в сезоне: 1, 2, 3 */
	number: number
	title: string
	description?: string
	/** Длительность «24:10»; пусто — не показывается */
	duration: string
	/** Картинка серии (`poster`), если адрес безопасен */
	poster?: string
	/** Эта серия сейчас играет */
	isCurrent: boolean
}

/** Глава в панели глав */
export interface MediaChapterItem {
	id: string
	title: string
	/** Начало главы, секунды */
	start: number
	/** Начало главы: «1:05» */
	time: string
	/** Цвет отрезка главы на шкале */
	color: string
	/** Эта глава сейчас играет */
	isCurrent: boolean
	/** Сколько главы просмотрено: от 0 до 1 */
	progress: number
}

/** Выдвижная панель плеера: серии справа, главы слева */
export interface MediaSidePanelOptions {
	/** Кнопка, которая открывает панель: на неё возвращается фокус при закрытии */
	trigger: string
	/** Что фокусировать при открытии: первый найденный по порядку селекторов */
	focus: readonly string[]
	isOpen: () => boolean
	close: () => void
}
