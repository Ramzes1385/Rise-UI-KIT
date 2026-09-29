import type { BaseComponentProps } from '@composables/useBaseComponent'

/** Варианты BaseVoiceRecorder: default — панель с рамкой, soft — приподнятый фон без рамки */
export const VOICE_RECORDER_VARIANTS = ['default', 'soft'] as const

/** Этап записи: ожидание, запрос доступа к микрофону, запись, прослушивание готовой записи, ошибка */
export const VOICE_RECORDER_STATES = ['idle', 'requesting', 'recording', 'preview', 'error'] as const

export type VoiceRecorderState = (typeof VOICE_RECORDER_STATES)[number]

/** Готовая запись: файл, его MIME, длительность в секундах и амплитуды для волны (0…1) */
export interface VoiceRecording {
	blob: Blob
	mimeType: string
	duration: number
	peaks: number[]
}

/** Ошибка записи: нет доступа к микрофону, микрофона нет, браузер не умеет записывать или запись сорвалась */
export interface VoiceRecorderError {
	code: 'denied' | 'no-device' | 'unsupported' | 'failed'
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
	/** Запись недоступна */
	isDisabled?: boolean
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
