import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/**
 * Варианты BaseAudioPlayer: default — карточка с рамкой, soft — приподнятый фон без рамки,
 * ghost — без фона и рамки, цвета от текста вокруг (голосовое сообщение в пузыре чата)
 */
export const AUDIO_PLAYER_VARIANTS = ['default', 'soft', 'ghost'] as const

/** Ошибка воспроизведения: запись не загрузилась или браузер не разрешил запуск */
export interface AudioPlayerError {
	code: 'network' | 'decode' | 'not-supported' | 'not-allowed' | 'unknown'
	/** Исходная ошибка медиаэлемента или отказ `play()` */
	cause?: unknown
}

/**
 * Пропсы компонента BaseAudioPlayer
 */
export interface BaseAudioPlayerProps extends BaseComponentProps<
	(typeof AUDIO_PLAYER_VARIANTS)[number],
	'root' | 'button' | 'waveform' | 'time' | 'rate'
> {
	/** Адрес записи: относительный или http:, https:, blob:, data: */
	src: string
	/** Название записи: доступное имя плеера; видно, если `hasTitle` */
	title: string
	/** Показывать название над волной */
	hasTitle?: boolean
	/** Амплитуды волны от 0 до 1. Без них плеер считает их из файла через Web Audio, если файл с того же сайта или отдаётся по CORS */
	peaks?: number[]
	/** Число столбиков волны, если амплитуды считает плеер */
	bars?: number
	/** Длительность до загрузки файла, секунды: например, из данных сообщения */
	duration?: number
	/** Позиция, секунды (`v-model:current-time`) */
	currentTime?: number
	/** Скорости, которые по кругу переключает кнопка скорости; меньше двух — кнопки нет */
	playbackRates?: number[]
	/** На странице играет только один такой плеер: запуск ставит остальные на паузу */
	isExclusive?: boolean
	/** Плеер недоступен: кнопки и волна не реагируют */
	isDisabled?: boolean
}

/**
 * События компонента BaseAudioPlayer
 */
export interface BaseAudioPlayerEmits {
	/** Воспроизведение началось */
	(event: 'play'): void
	/** Воспроизведение остановлено, в том числе в конце записи */
	(event: 'pause'): void
	/** Запись доиграла до конца */
	(event: 'ended'): void
	/** Запись не загрузилась или браузер не разрешил запуск */
	(event: 'error', error: AudioPlayerError): void
	/** Новая позиция: воспроизведение, перемотка по волне или клавишами */
	(event: 'update:currentTime', time: number): void
}

/**
 * Методы через ref
 */
export interface BaseAudioPlayerExpose {
	play: () => Promise<void>
	pause: () => void
	/** Аудиоэлемент — для интеграций; до монтирования null */
	getMediaElement: () => HTMLAudioElement | null
}
