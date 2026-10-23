import type { UiProp } from '@composables/base/useUi'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/** Варианты BaseVoiceRecorder: default — панель с рамкой, soft — приподнятый фон без рамки */
export const VOICE_RECORDER_VARIANTS = ['default', 'soft'] as const

/** Этап записи: ожидание, запрос доступа к микрофону, запись, прослушивание готовой записи, ошибка */
export const VOICE_RECORDER_STATES = ['idle', 'requesting', 'recording', 'preview', 'error'] as const

export type VoiceRecorderState = (typeof VOICE_RECORDER_STATES)[number]

/**
 * Части BaseVoiceRecorder для пропа `ui` (БЭМ-элементы `.base-voice-recorder__<часть>`, `root` — вся панель):
 * dot — мигающая точка записи, time — время записи, meter — индикатор уровня, level — столбик уровня,
 * preview — плеер готовой записи, error — текст ошибки, status — скрытый статус для скринридера.
 */
export const VOICE_RECORDER_PARTS = ['dot', 'time', 'meter', 'level', 'preview', 'error', 'status'] as const

export type BaseVoiceRecorderPart = (typeof VOICE_RECORDER_PARTS)[number]

/** Готовая запись: файл, его MIME, длительность в секундах и амплитуды для волны (0…1) */
export interface VoiceRecording {
	blob: Blob
	mimeType: string
	duration: number
	peaks: number[]
}

/**
 * Ошибка записи: нет доступа к микрофону, микрофона нет, страница открыта не по HTTPS (браузер не даёт микрофон),
 * браузер не умеет записывать или запись сорвалась
 */
export interface VoiceRecorderError {
	code: 'denied' | 'no-device' | 'insecure' | 'unsupported' | 'failed'
	cause?: unknown
}

/**
 * Пропсы компонента BaseVoiceRecorder
 */
export interface BaseVoiceRecorderProps extends BaseComponentProps<(typeof VOICE_RECORDER_VARIANTS)[number], 'root' | 'meter' | 'preview'> {
	/** Предельная длительность записи, секунды: по ней запись останавливается сама */
	maxDuration?: number
	/** Желаемый формат записи; без него — первый поддерживаемый из audio/webm, audio/ogg (Opus) и audio/mp4 */
	mimeType?: string
	/** Число столбиков волны готовой записи */
	bars?: number
	/** После остановки показать запись для прослушивания с «Удалить» и «Отправить»; без этого запись отдаётся сразу */
	hasPreview?: boolean
	/**
	 * Источник звука вместо микрофона: функция возвращает MediaStream — например, звук из Web Audio для демо и тестов
	 * или заранее выбранное устройство. По умолчанию — `navigator.mediaDevices.getUserMedia({ audio: true })`:
	 * браузер спрашивает доступ к микрофону
	 */
	requestStream?: () => Promise<MediaStream>
	/** Запись недоступна */
	isDisabled?: boolean
	/**
	 * Классы частей (`root`, `dot`, `meter`, `level`, `preview`… — см. `VOICE_RECORDER_PARTS`) — добавляются к классам кита.
	 * Глобально — `defaults.BaseVoiceRecorder.ui` плагина, классы склеиваются.
	 *
	 * @example
	 * <BaseVoiceRecorder :ui="{ root: 'shadow-sm', level: 'opacity-80' }" />
	 */
	ui?: UiProp<BaseVoiceRecorderPart>
}

/**
 * События компонента BaseVoiceRecorder
 */
export interface BaseVoiceRecorderEmits {
	/** Запись готова к отправке: после «Отправить» или сразу после остановки без `hasPreview` */
	(event: 'record', recording: VoiceRecording): void
	/** Запись отменена или удалена */
	(event: 'cancel'): void
	/** Нет доступа к микрофону, микрофона нет или запись сорвалась */
	(event: 'error', error: VoiceRecorderError): void
	/** Этап записи сменился */
	(event: 'state-change', state: VoiceRecorderState): void
}

/**
 * Методы через ref
 */
export interface BaseVoiceRecorderExpose {
	/** Начать запись: запрашивает доступ к микрофону */
	start: () => Promise<void>
	/** Остановить запись */
	stop: () => void
	/** Отменить запись или удалить готовую */
	cancel: () => void
}
