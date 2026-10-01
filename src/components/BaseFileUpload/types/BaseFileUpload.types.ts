import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

export const FILE_UPLOAD_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

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
	/** Статус загрузки */
	status: 'pending' | 'uploading' | 'done' | 'error'
	/** Прогресс загрузки (0–100) */
	progress: number
}

export interface BaseFileUploadProps extends BaseComponentProps<
	(typeof FILE_UPLOAD_VARIANTS)[number],
	| 'root'
	| 'label'
	| 'dropzone'
	| 'text'
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
	| 'errors'
	| 'errorItem'
> {
	/** Принимаемые типы файлов (MIME или расширения) */
	accept?: string
	/** Множественный выбор */
	isMultiple?: boolean
	/** Отключенное состояние */
	isDisabled?: boolean
	/** Максимальное размер файла (MB) */
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
	/** Разрешить предпросмотр (изображения) */
	allowPreview?: boolean
	/** Текст пустой зоны */
	emptyText?: string
	/** Текст ошибки */
	error?: string
}

export interface BaseFileUploadEmits {
	(event: 'change', files: File[]): void
	(event: 'error', message: string): void
	(event: 'remove', file: UploadedFile): void
}

export interface BaseFileUploadSlots {
	/** Кастомная зона загрузки */
	trigger?: () => unknown
}

export type FileUploadProps = PropsWithDefaults<BaseFileUploadProps, 'accept' | 'isMultiple' | 'maxSize' | 'maxCount' | 'sizeScale'>
