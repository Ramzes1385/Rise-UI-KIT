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
