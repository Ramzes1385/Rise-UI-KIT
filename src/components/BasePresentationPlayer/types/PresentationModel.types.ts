import type { Ref } from 'vue'
import type { MediaCueSegment } from '@components/BaseMediaPlayer/types/content/MediaSubtitles.types'

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
	/** Вкладка видна: таймер слайда без озвучки идёт только тогда */
	isVisible: Readonly<Ref<boolean>>
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
	/** Скорости меню: в режиме `strict` — не выше `maxRate` */
	rates: () => number[]
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
	/** Клавиша C — субтитры */
	toggleCaptions: () => void
	/** Соседняя скорость из списка: 1 — быстрее, -1 — медленнее */
	stepRate: (direction: 1 | -1) => void
}

/** Элементы плеера */
export interface PresentationElements {
	rootRef: ElementRef<HTMLElement>
	audioRef: ElementRef<HTMLAudioElement>
	videoRef: ElementRef<HTMLVideoElement>
}

/** Откуда учёт прохождения берёт состояние показа и как переводит слайды */
export interface PresentationProgressSource {
	/** Номер текущего слайда */
	index: () => number
	isPlaying: () => boolean
	/** Вкладка видна */
	isVisible: () => boolean
	/** У слайда есть озвучка, видео или `duration`: без них слайд пройден по `minDuration` */
	hasClock: () => boolean
	/** Перейти к слайду после прохождения; `resume` — продолжить показ, остановленный на границе общей дорожки */
	advanceTo: (index: number, resume: boolean) => void
	/** Остановить показ */
	pause: () => void
}

/** Откуда сохранение в localStorage берёт место и пройденные слайды */
export interface PresentationStorageSource {
	/** Номер текущего слайда */
	index: () => number
	/** Ключи пройденных слайдов */
	completed: () => string[]
	/** Показ дошёл до конца: сохраняется начало */
	isFinished: () => boolean
	/** Вернуть пройденные слайды из сохранения */
	restore: (ids: string[]) => void
	/** Перейти к слайду; false — переход закрыт режимом */
	goTo: (index: number) => boolean
}

/** Откуда кнопка «Следующий слайд» берёт, закрыт ли переход и сколько ждать */
export interface PresentationLockSource {
	/** Номер текущего слайда */
	index: () => number
	/** Число слайдов */
	count: () => number
	/** Позиция внутри слайда, секунды */
	slideTime: () => number
	/** Длительность слайда, секунды; NaN — неизвестна */
	slideDuration: () => number
	/** Скорость показа */
	rate: () => number
	/** Сколько секунд слайд был на экране во время показа */
	watched: () => number
	/** `minDuration` текущего слайда */
	minDuration: () => number
	/** Озвучка, видео или показ по `duration` кончились */
	isMediaDone: () => boolean
	/** Слайд-вопрос ждёт ответа */
	isAwaitingAnswer: () => boolean
	/** Можно ли перейти к слайду */
	canGoTo: (index: number) => boolean
	/** Следующий слайд; false — переход закрыт */
	next: () => boolean
}

/** Что нужно субтитрам от показа */
export interface PresentationCaptionsSource {
	/** Номер текущего слайда */
	index: () => number
	/** Идёт общая дорожка `audio` */
	isShared: () => boolean
	/** Время для субтитров: от начала дорожки при общей дорожке, иначе от начала слайда */
	time: () => number
}

/** Вид выдвижной панели: список слайдов или стенограмма */
export type PresentationPanelView = 'slides' | 'notes'

/** Что нужно панели от показа */
export interface PresentationPanelSource {
	/** Корень плеера: туда возвращается фокус после закрытия */
	root: () => HTMLElement | null
	index: () => number
	isCompleted: (index: number) => boolean
	canGoTo: (index: number) => boolean
	goTo: (index: number) => void
	/** Выбран недоступный слайд */
	onLocked: () => void
}

/** Карточка слайда в списке */
export interface PresentationSlideCard {
	id: string
	index: number
	number: number
	title: string
	image?: string
	/** Длительность «0:12» или пусто */
	duration: string
	isCurrent: boolean
	isCompleted: boolean
	/** Недоступен в режимах `linear` и `strict` */
	isLocked: boolean
}

/** Синтез речи слайда */
export interface SlideSpeechOptions {
	/** Текст текущего слайда или `undefined` */
	text: () => string | undefined
	/** Ключ слайда: смена — новая речь */
	key: () => string | undefined
	/** Речь должна идти */
	isRunning: () => boolean
	rate: () => number
	volume: () => number
	isMuted: () => boolean
	/** Голос: `name` или `voiceURI` */
	voice: () => string | undefined
	/** Язык кита */
	lang: () => string
	/** Речь дочитана */
	onEnd: () => void
}

/**
 * Значок замка у недоступного слайда в списке — контур «lock» Font Awesome Free (Fonticons, Inc., https://fontawesome.com),
 * набор Solid, лицензия CC BY 4.0; поле 448×512. В наборе значков плеера замка нет, а интерфейс плеера не меняется
 */
export const PRESENTATION_LOCK_ICON =
	'M144 144v48h160v-48c0-44.2-35.8-80-80-80s-80 35.8-80 80zm-64 48v-48C80 64.5 144.5 0 224 0s144 64.5 144 144v48h16c35.3 0 64 28.7 64 64v192c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V256c0-35.3 28.7-64 64-64h16z'

/** Пропсы вывода субтитров PresentationCaptions */
export interface PresentationCaptionsProps {
	/** Строки текущей реплики — разметка как у BaseMediaPlayer */
	lines: MediaCueSegment[][]
	/** Положение плашки: `left` и `top` в процентах */
	boxStyle: Record<string, string>
}
