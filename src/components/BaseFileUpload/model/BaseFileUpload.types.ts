import type { CustomClassProp } from '@composables/useCustomClass'
import type { CustomColor } from '@composables/useCustomColor'

/** Варианты отображения загрузки файлов */
export const FILE_UPLOAD_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

/**
 * Загруженный файл
 */
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

/**
 * Пропсы компонента BaseFileUpload
 */
export interface BaseFileUploadProps {
	/** Кастомные классы */
	customClass?: CustomClassProp
	/** Принимаемые типы файлов (MIME или расширения) */
	accept?: string
	/** Множественный выбор */
	isMultiple?: boolean
	/** Отключенное состояние */
	isDisabled?: boolean
	/** Вариант отображения */
	variant?: (typeof FILE_UPLOAD_VARIANTS)[number]
	/** Кастомный цвет компонента */
	color?: CustomColor
	/** Максимальное размер файла (MB) */
	maxSize?: number
	/** Максимальное количество файлов */
	maxCount?: number
	/** Заголовок */
	label?: string
	/** Текст кнопки */
	buttonText?: string
	/** Размер превью в пикселях */
	previewSize?: number
	/** Разрешить предпросмотр (изображения) */
	allowPreview?: boolean
	/** Текст пустой зоны */
	emptyText?: string
	/** Масштаб размера (100 = 100%, 150 = 150%, 75 = 75%) */
	sizeScale?: number
	/** Текст ошибки */
	error?: string
}

/**
 * События компонента BaseFileUpload
 */
export interface BaseFileUploadEmits {
	(event: 'change', files: File[]): void
	(event: 'error', message: string): void
	(event: 'remove', file: UploadedFile): void
}
