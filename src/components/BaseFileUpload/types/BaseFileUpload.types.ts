import type { UiProp } from '@composables/base/useUi'
import type { FormFieldExpose } from '@composables/form/useFormField'
import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

export const FILE_UPLOAD_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

/**
 * Части BaseFileUpload для пропа `ui` (БЭМ-элементы `.base-file-upload__<часть>`, `root` — весь компонент): label,
 * dropzone — зона выбора, icon, text, drop-text, hint; список: list, item — строка файла, preview, info, name, meta,
 * status, file-error, progress, retry, remove; errors — список ошибок, error-item.
 */
export const FILE_UPLOAD_PARTS = [
	'label',
	'dropzone',
	'icon',
	'text',
	'drop-text',
	'hint',
	'list',
	'item',
	'preview',
	'info',
	'name',
	'meta',
	'status',
	'file-error',
	'progress',
	'retry',
	'remove',
	'errors',
	'error-item',
] as const

export type BaseFileUploadPart = (typeof FILE_UPLOAD_PARTS)[number]

/**
 * Статус файла в списке:
 * `selected` — выбран, приложение загрузку не передало (без `uploader`);
 * `uploading` — идёт загрузка через `uploader`; `done` — `uploader` завершился успешно; `error` — `uploader` отклонил промис.
 */
export const FILE_UPLOAD_STATUSES = ['selected', 'uploading', 'done', 'error'] as const

export type FileUploadStatus = (typeof FILE_UPLOAD_STATUSES)[number]

/** Что `uploader` получает вторым аргументом */
export interface FileUploaderContext {
	/** Сообщить прогресс загрузки, 0–100 (значения вне диапазона обрезаются) */
	onProgress: (percent: number) => void
	/** Отменяется, когда файл удалён, заменён, список сброшен или компонент размонтирован */
	signal: AbortSignal
}

/**
 * Функция загрузки файла приложения. Промис выполнен — файл загружен (`done`, событие `upload-success` с результатом),
 * отклонён — ошибка (`error`, текст — `message` ошибки, событие `upload-error`).
 */
export type FileUploader = (file: File, context: FileUploaderContext) => Promise<unknown>

export interface UploadedFile {
	/** Уникальный идентификатор */
	id: string
	/** Оригинальный файл */
	file: File
	/** Имя файла */
	name: string
	/** Размер в байтах */
	size: number
	/** MIME-тип */
	type: string
	/** Расширение */
	extension: string
	/** URL для превью (для изображений) */
	previewUrl: string | null
	/** Статус загрузки (`FILE_UPLOAD_STATUSES`) */
	status: FileUploadStatus
	/** Прогресс загрузки (0–100) — только из `onProgress` функции `uploader` */
	progress: number
	/** Текст ошибки загрузки (статус `error`) */
	error?: string
}

export interface BaseFileUploadProps extends BaseComponentProps<
	(typeof FILE_UPLOAD_VARIANTS)[number],
	| 'root'
	| 'label'
	| 'dropzone'
	| 'text'
	| 'dropText'
	| 'hint'
	| 'list'
	| 'item'
	| 'preview'
	| 'previewImg'
	| 'info'
	| 'name'
	| 'meta'
	| 'ext'
	| 'size'
	| 'status'
	| 'progress'
	| 'remove'
	| 'fileError'
	| 'retry'
	| 'errors'
	| 'errorItem'
> {
	/** Принимаемые типы файлов (MIME или расширения) */
	accept?: string
	/** Множественный выбор */
	isMultiple?: boolean
	/** Отключенное состояние */
	isDisabled?: boolean
	/** Обязательное поле: `validate()` без выбранных файлов вернёт `false` и покажет ошибку; у заголовка — звёздочка */
	isRequired?: boolean
	/**
	 * Функция загрузки приложения: кит вызывает её для каждого принятого файла и показывает её прогресс и итог.
	 * Без неё файлы только выбираются (статус `selected`) — без прогресса и «Загружено».
	 */
	uploader?: FileUploader
	/** Максимальный размер файла (МБ); `0` — без ограничения */
	maxSize?: number
	/** Максимальное количество файлов */
	maxCount?: number
	/** Заголовок */
	label?: string
	/** Текст кнопки */
	buttonText?: string
	/**
	 * Размер превью (и иконки файла) в строке списка, px; масштабируется `sizeScale`.
	 * Без пропа — 40px из стилей.
	 */
	previewSize?: number
	/** Миниатюры изображений в списке и их увеличение по клику; `false` — иконка типа файла */
	allowPreview?: boolean
	/** Подсказка о перетаскивании под текстом кнопки в зоне; пустая строка — без подсказки */
	emptyText?: string
	/** Текст ошибки */
	error?: string
	/**
	 * Классы частей (`root`, `dropzone`, `list`, `item`, `name`… — см. `FILE_UPLOAD_PARTS`) — добавляются к классам кита.
	 * Глобально — `defaults.BaseFileUpload.ui` плагина, классы склеиваются.
	 *
	 * @example
	 * <BaseFileUpload :ui="{ dropzone: 'min-h-40', item: 'shadow-sm' }" />
	 */
	ui?: UiProp<BaseFileUploadPart>
}

export interface BaseFileUploadEmits {
	(event: 'change', files: File[]): void
	(event: 'error', message: string): void
	(event: 'remove', file: UploadedFile): void
	/** `uploader` завершился успешно; `response` — результат его промиса */
	(event: 'upload-success', file: UploadedFile, response: unknown): void
	/** `uploader` отклонил промис; `message` — текст ошибки под файлом */
	(event: 'upload-error', file: UploadedFile, message: string): void
}

/** Методы, доступные через ref компонента */
export interface BaseFileUploadExpose extends FormFieldExpose {
	/** Повторить загрузку файла со статусом `error` */
	retry: (file: UploadedFile) => void
}

export interface BaseFileUploadSlots {
	/** Кастомная зона загрузки */
	trigger?: () => unknown
}

export type FileUploadProps = PropsWithDefaults<
	BaseFileUploadProps,
	'accept' | 'isMultiple' | 'maxSize' | 'maxCount' | 'sizeScale' | 'allowPreview' | 'emptyText'
>
