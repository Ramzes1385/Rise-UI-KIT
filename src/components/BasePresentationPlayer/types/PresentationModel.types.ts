import type { Ref } from 'vue'

/** Ссылка на элемент: null до монтирования */
export type ElementRef<T extends HTMLElement> = Readonly<Ref<T | null>>

/** Таймер показа слайда без озвучки */
export interface SlideTimerOptions {
	/** Длительность слайда, секунды; не число — таймер не идёт */
	duration: () => number
	/** Скорость показа */
	rate: () => number
	/** Таймер идёт: показ запущен, у слайда нет озвучки */
	isRunning: () => boolean
	/** Слайд показан до конца */
	onEnd: () => void
}

/** Откуда воспроизведение слайдов берёт текущий слайд и куда сообщает о смене */
export interface SlidePlaybackOptions {
	/** Номер текущего слайда */
	index: Readonly<Ref<number>>
	/** Показ запущен: озвучка или таймер слайда идут */
	isPlaying: Ref<boolean>
	/** Элемент озвучки */
	audioRef: ElementRef<HTMLAudioElement>
	/** Видео текущего слайда */
	videoRef: ElementRef<HTMLVideoElement>
	/** Слайд показан до конца: озвучка, видео или `duration` */
	onSlideEnd: () => void
	/** Общая дорожка дошла до следующего слайда */
	onTrackSlide: (index: number) => void
}

/** Откуда панель берёт состояние показа и куда передаёт команды */
export interface PresentationControlsSource {
	/** Номер текущего слайда */
	index: () => number
	/** Позиция внутри слайда, секунды */
	slideTime: () => number
	/** Длительность слайда, секунды; NaN — неизвестна */
	slideDuration: () => number
	isPlaying: () => boolean
	isMuted: () => boolean
	/** Громкость от 0 до 1 */
	volume: () => number
	/** Скорость показа */
	rate: () => number
	isFullscreen: () => boolean
	/** Перейти к началу слайда */
	goTo: (index: number) => void
	/** Перейти к позиции внутри текущего слайда */
	seekInSlide: (time: number) => void
	setRate: (rate: number) => void
}

/** Откуда полный экран, скрытие панели и горячие клавиши берут состояние и команды */
export interface PresentationScreenSource {
	/** Элемент, который сейчас звучит: для полного экрана видео в Safari на iOS */
	media: () => HTMLMediaElement | null
	isPlaying: () => boolean
	/** Громкость от 0 до 1 */
	volume: () => number
	togglePlay: () => void
	next: () => void
	previous: () => void
	/** Перейти к слайду по номеру с нуля */
	goTo: (index: number) => void
	setVolume: (volume: number) => void
	toggleMute: () => void
	/** Соседняя скорость из списка: 1 — быстрее, -1 — медленнее */
	stepRate: (direction: 1 | -1) => void
}
