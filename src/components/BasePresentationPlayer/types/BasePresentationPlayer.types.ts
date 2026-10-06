import type { UiProp } from '@composables/base/useUi'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/** Варианты оформления BasePresentationPlayer: один — тёмный кадр плеера BaseMediaPlayer */
export const PRESENTATION_PLAYER_VARIANTS = ['default'] as const

/**
 * Части BasePresentationPlayer для пропа `ui` (БЭМ-элементы `.base-presentation-player__<часть>`, `root` — весь плеер):
 * stage — кадр со слайдами, slide — текущий слайд, next — обёртка кнопки «Далее», ring — кольцо замка вокруг «Далее»,
 * done — экран «Презентация пройдена», done-icon, done-title, done-text — его значок, заголовок и текст, panel — боковая
 * панель «Список слайдов» и «Стенограмма», notes — стенограмма, notes-title, notes-text — её заголовок и абзацы,
 * card-mark — отметка карточки слайда (замок или галочка). Части оболочки BaseMediaPlayer (`.base-media-player__*`) —
 * у BaseMediaPlayer
 */
export const PRESENTATION_PLAYER_PARTS = [
	'root',
	'stage',
	'slide',
	'next',
	'ring',
	'done',
	'done-icon',
	'done-title',
	'done-text',
	'panel',
	'notes',
	'notes-title',
	'notes-text',
	'card-mark',
] as const

/** Часть BasePresentationPlayer для пропа `ui` */
export type BasePresentationPlayerPart = (typeof PRESENTATION_PLAYER_PARTS)[number]

/** Варианты оформления */
export type PresentationPlayerVariant = (typeof PRESENTATION_PLAYER_VARIANTS)[number]

/**
 * Режимы листания: `free` — свободно; `linear` — вперёд только после прохождения слайда (кончилась озвучка и прошло
 * `minDuration`), назад — свободно; `strict` — как `linear`, плюс скорость не выше `maxRate`, без перемотки озвучки вперёд
 * внутри слайда и пауза, когда вкладка скрыта
 */
export const PRESENTATION_NAVIGATION_MODES = ['free', 'linear', 'strict'] as const

/** Режим листания */
export type PresentationNavigation = (typeof PRESENTATION_NAVIGATION_MODES)[number]

/** Слайд презентации */
export interface PresentationSlide {
	/** Ключ слайда: события, сохранённый прогресс, переход между слайдами */
	id: string
	/** Название: «Слайд 3 из 12: Название», подсказка над шкалой */
	title: string
	/** Картинка слайда: относительный адрес или http:, https:, blob:, data: */
	image?: string
	/** Видео вместо картинки; без своей озвучки звук и длительность слайда берутся из видео */
	video?: string
	/** Описание картинки или видео для скринридера; без него — название слайда */
	alt?: string
	/** Озвучка слайда: слайд идёт до её конца, затем — следующий */
	audio?: string
	/** Начало слайда на общей дорожке `audio` плеера, секунды; без него — конец предыдущего слайда */
	at?: number
	/**
	 * Длительность показа слайда без озвучки, секунды: затем — следующий слайд. Без озвучки и без `duration` слайд стоит,
	 * пока его не перелистнут
	 */
	duration?: number
	/**
	 * Сколько секунд слайд должен быть на экране в режимах `linear` и `strict`, прежде чем откроется следующий: время идёт,
	 * только пока вкладка видна и идёт показ. Слайд пройден, когда кончилась озвучка и прошло это время — что позже
	 */
	minDuration?: number
	/**
	 * Субтитры озвучки слайда — адрес файла WebVTT или SRT (http, https, blob, data); время — от начала слайда. Разбор —
	 * `parseSubtitles` из `subtitleUtils`, вывод — как у BaseMediaPlayer. У общей дорожки — проп `captions` плеера
	 */
	captions?: string
	/** Стенограмма слайда — текст для панели «Стенограмма»; абзацы — через пустую строку */
	notes?: string
	/**
	 * Текст озвучки слайда, если у слайда нет `audio` и `video` и не задана общая дорожка. С `speechProvider` текст
	 * озвучивает сервис приложения, и слайд играет как запись (перемотка, скорость, лоадер); без него или при ошибке
	 * сервиса — синтез речи браузера (`speechSynthesis`): голос — по языку кита или `speechVoice`; голосов нет — слайд
	 * идёт по `duration`. Голоса браузера и их качество зависят от системы: для обучения лучше сервис или запись
	 */
	speech?: string
	/**
	 * Слайд-вопрос: пройден, только когда слот `slide` вызвал `complete()` (и кончилась озвучка, прошло `minDuration`).
	 * После конца озвучки показ ждёт ответа и сам дальше не идёт
	 */
	isInteractive?: boolean
}

/** Запрос озвучки слайда поставщику `speechProvider` */
export interface PresentationSpeechRequest {
	/** `speechVoice` плеера как есть — имя голоса поставщика (`filipp`, `jane`) */
	voice?: string
	/** Язык кита (`ru`, `en`) */
	lang: string
	/** Номер слайда с нуля — для логов и кэша приложения */
	slide: number
	/** Отмена запроса: смена слайда, размонтирование плеера или таймаут 15 с */
	signal: AbortSignal
}

/**
 * Поставщик озвучки слайдов: текст → аудио. Обычно — `createFetchSpeechProvider({ url: '/api/tts' })` к посреднику
 * приложения: ключ сервиса синтеза (SpeechKit, SaluteSpeech…) остаётся на сервере. Плеер кэширует озвучку восьми
 * последних фраз, грузит текущий и следующий слайд заранее, отменяет лишние запросы и ждёт ответ не дольше 15 с
 */
export interface PresentationSpeechProvider {
	/**
	 * Аудио фразы: Blob (mp3, ogg, wav) или адрес файла. Отклонение, таймаут или ошибка воспроизведения — событие
	 * `speech-error` и откат слайда на синтез речи браузера; отмена по `options.signal` — не ошибка
	 */
	synthesize(text: string, options: PresentationSpeechRequest): Promise<Blob | string>
}

/** Данные события `speech-error` */
export interface PresentationSpeechError {
	/** Номер слайда с нуля */
	slide: number
	/** Причина: отклонение поставщика, `DOMException` `TimeoutError` или ошибка `<audio>` на полученном адресе */
	error: unknown
}

/** Данные события `slide-complete` */
export interface PresentationSlideComplete {
	/** Ключ слайда */
	id: string
	/** Номер слайда с нуля */
	index: number
	/** Время прохождения, мс от 1970 (`Date.now()`): по нему сервер проверяет, не слишком ли быстро пройдены слайды */
	at: number
}

/** Данные события `progress` */
export interface PresentationProgress {
	/** Пройдено слайдов */
	completed: number
	/** Всего слайдов */
	total: number
}

/** Что хранится в localStorage по `storageKey` */
export interface PresentationSavedProgress {
	/** Номер слайда, с которого продолжить */
	index: number
	/** Ключи пройденных слайдов */
	completed: string[]
}

/** Данные слайда для слота `slide` */
export interface PresentationSlideSlotProps {
	/** Слайд */
	slide: PresentationSlide
	/** Номер слайда с нуля */
	index: number
	/** Отметить слайд-вопрос (`isInteractive`) отвеченным; у обычного слайда ничего не делает */
	complete: () => void
	/** Слайд уже пройден */
	isCompleted: boolean
}

/** Пропсы компонента BasePresentationPlayer */
export interface BasePresentationPlayerProps extends BaseComponentProps<PresentationPlayerVariant, 'root' | 'stage' | 'controls'> {
	/** Слайды по порядку */
	slides: PresentationSlide[]
	/** Название презентации: доступное имя плеера и подпись над кадром */
	title: string
	/**
	 * Общая дорожка озвучки на всю презентацию: начало каждого слайда — `slides[].at`. Своя озвучка слайдов
	 * (`slides[].audio`) при общей дорожке не используется, видео слайдов идут без звука
	 */
	audio?: string
	/** Номер текущего слайда с нуля (`v-model:slide`) */
	slide?: number
	/** Показывать название над кадром вместе с панелью */
	hasTitle?: boolean
	/** Горячие клавиши, пока фокус внутри плеера: ←/→ — слайды, Space/K — пауза, F — полный экран, M — звук, ↑/↓ — громкость */
	hasKeyboardShortcuts?: boolean
	/** Скорости в меню скорости */
	playbackRates?: number[]
	/** Пропорции кадра, CSS `aspect-ratio` */
	aspectRatio?: string
	/** Время без движения до скрытия панели во время показа, мс */
	idleTimeout?: number
	/** Атрибут `crossorigin` картинок, видео и озвучки */
	crossorigin?: 'anonymous' | 'use-credentials'
	/** Режим листания: свободно, по порядку или строго */
	navigation?: PresentationNavigation
	/** Наибольшая скорость в режиме `strict` */
	maxRate?: number
	/**
	 * Ключ в localStorage: место и пройденные слайды сохраняются, при следующем открытии — «Продолжить со слайда 5?».
	 * Это удобство для зрителя, а не контроль: строгий учёт — на сервере по событиям `slide-complete`
	 */
	storageKey?: string
	/** Субтитры общей дорожки `audio` — адрес WebVTT или SRT; время — от начала дорожки */
	captions?: string
	/** Субтитры показаны (`v-model:is-captions-on`); кнопка «Субтитры» и клавиша C — когда субтитры есть хотя бы у одного слайда */
	isCaptionsOn?: boolean
	/**
	 * Голос озвучки `slides[].speech`: с `speechProvider` — имя голоса поставщика, уходит в запрос как есть; без него —
	 * `name` или `voiceURI` из `speechSynthesis.getVoices()`, не найден — голос по языку кита
	 */
	speechVoice?: string
	/**
	 * Сервис озвучки `slides[].speech` вместо синтеза речи браузера: `createFetchSpeechProvider` или свой объект с
	 * `synthesize`. Смена поставщика или `speechVoice` сбрасывает кэш озвучки
	 */
	speechProvider?: PresentationSpeechProvider
	/**
	 * Классы частей (`root`, `stage`, `slide`, `done`, `panel`, `notes`… — см. `PRESENTATION_PLAYER_PARTS`) — добавляются
	 * к классам кита. Глобально — `defaults.BasePresentationPlayer.ui` плагина, классы склеиваются.
	 *
	 * @example
	 * <BasePresentationPlayer :slides="slides" title="Курс" :ui="{ stage: 'rounded-xl', done: 'backdrop-blur' }" />
	 */
	ui?: UiProp<BasePresentationPlayerPart>
}

/** События компонента BasePresentationPlayer */
export interface BasePresentationPlayerEmits {
	/** Сменился текущий слайд: номер с нуля */
	(event: 'update:slide', index: number): void
	/** Показ запущен */
	(event: 'play'): void
	/** Показ на паузе */
	(event: 'pause'): void
	/** Слайд пройден: кончилась озвучка или показ по `duration` и прошло `minDuration`; у каждого слайда — один раз */
	(event: 'slide-complete', value: PresentationSlideComplete): void
	/** Сколько слайдов пройдено: после каждого `slide-complete` */
	(event: 'progress', value: PresentationProgress): void
	/** Пройдены все слайды */
	(event: 'complete'): void
	/** Субтитры включены или выключены */
	(event: 'update:isCaptionsOn', value: boolean): void
	/** Сервис озвучки не ответил, ответил ошибкой или аудио не воспроизвелось: слайд ушёл на синтез речи браузера */
	(event: 'speech-error', value: PresentationSpeechError): void
}

/** Слоты компонента BasePresentationPlayer */
export interface BasePresentationPlayerSlots {
	/** Свой HTML слайда вместо картинки или видео */
	slide?: (props: PresentationSlideSlotProps) => unknown
}

/** Методы компонента через ref */
export interface BasePresentationPlayerExpose {
	/** Запустить показ */
	play: () => void
	/** Поставить на паузу */
	pause: () => void
	/** Следующий слайд */
	next: () => void
	/** Предыдущий слайд */
	previous: () => void
	/** Перейти к слайду по номеру с нуля */
	goTo: (index: number) => void
}
